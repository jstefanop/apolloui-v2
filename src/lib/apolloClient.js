import { useMemo } from 'react';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
  from,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import os from 'os';
import { onError } from '@apollo/client/link/error';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import moment from './moment';
import { sendFeedback } from '../redux/slices/feedbackSlice';
import { store } from '../redux/store';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

const ls = typeof window !== 'undefined' ? localStorage : { getItem: () => null };

// Server-side hostname fallback (SSR / Next.js API routes).
const ssrHostname = process.env.NEXT_PUBLIC_GRAPHQL_HOST || os.hostname();
const portApi = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 5000;

// Build a backend URL for the given path (e.g. '/api/graphql', '/health'),
// deriving scheme/host/port from window.location at request time. Two modes:
//
//  - HTTP page (direct LAN access, the common case): the backend runs as a
//    separate service on the same host at port 5000 → http://<host>:5000<path>.
//    Using window.location.hostname means every device targets the interface it
//    was opened from (works with WiFi + Ethernet both active).
//
//  - HTTPS page: the device itself only serves plain HTTP, so an HTTPS page is
//    necessarily behind a reverse proxy that terminates TLS. Use the SAME
//    origin (window.location.host, no explicit port) so the proxy can forward
//    /api/graphql (with WS upgrade) and /health to the backend. This avoids
//    mixed-content blocking and uses wss:// for subscriptions.
//
// `ws: true` selects the WebSocket scheme (ws/wss) instead of http/https.
export function getBackendUrl(path, { ws = false } = {}) {
  if (typeof window === 'undefined') {
    return `${ws ? 'ws' : 'http'}://${ssrHostname}:${portApi}${path}`;
  }
  const { protocol, hostname, host } = window.location;
  if (protocol === 'https:') {
    return `${ws ? 'wss' : 'https'}://${host}${path}`;
  }
  return `${ws ? 'ws' : 'http'}://${hostname}:${portApi}${path}`;
}

let apolloClient;

const isMoment = (value) => {
  return value && typeof value === 'object' && value._isAMomentObject;
};

const convertMomentToString = (obj) => {
  if (!obj) return obj;

  if (isMoment(obj)) {
    return obj.format();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertMomentToString);
  }

  if (typeof obj === 'object' && obj !== null) {
    if (obj._reactFragment || obj.constructor.name !== 'Object') {
      return obj;
    }

    const result = {};
    Object.keys(obj).forEach(key => {
      result[key] = convertMomentToString(obj[key]);
    });
    return result;
  }

  return obj;
};

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) => {
      const err = `[GraphQL error]: Message: ${message}, Operation: ${operation.operationName}`;
      store.dispatch(sendFeedback({ message: err, type: 'error' }));
      console.log(err);
    });
  if (networkError) {
    let err;
    if (networkError.message === 'Timeout exceeded') {
      err = `[Timeout error]: Operation: ${operation.operationName}`;
    } else if (networkError.message === 'Failed to fetch') {
      err = `[Connection error]: Backend service is unavailable, Operation: ${operation.operationName}`;
    } else {
      err = `[Network error]: ${networkError.message}, Operation: ${operation.operationName}`;
    }
    store.dispatch(sendFeedback({ message: err, type: 'error' }));
    console.log(err);
  }
});

const httpLink = new HttpLink({
  uri: () => getBackendUrl('/api/graphql'),
  fetchOptions: {
    timeout: 10000,
  },
});

const authLink = new ApolloLink((operation, forward) => {
  const token = ls.getItem('token');
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

const momentTransformLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    if (response.data) {
      response.data = convertMomentToString(response.data);
    }
    return response;
  });
});

// Add a utility function to check if the backend is available
export const checkBackendAvailability = async () => {
  try {
    const response = await fetch(getBackendUrl('/health'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    console.log('[Backend health check failed]:', error.message);
    return false;
  }
};

// ---------------------------------------------------------------------------
// WS connection status — tracked module-level, published to React subscribers
// ---------------------------------------------------------------------------
// Status values: 'connecting' | 'online' | 'offline' | 'unauthorized'
//
// 'unauthorized' is not a degree of 'offline': the backend is there and
// answering, it is the token it will not take. Treating the two alike sent
// people to check cables and services while the fix was to sign in again.
let _wsStatus = 'connecting';
const _wsStatusListeners = new Set();
// True once we successfully connect for the first time in this page session.
let _everConnected = false;
// Reference to the single pending offline timer. We only ever start ONE timer
// and never reset it on subsequent retry 'closed' events — that was the bug
// where every failed retry would restart the countdown from zero.
let _offlineTimer = null;

// Grace period before declaring the backend offline:
//  - 8 s if we have never successfully connected (fresh page load, backend down)
//  - 15 s if we lost a previously-working connection (brief drop / restart)
const WS_FIRST_CONNECT_TIMEOUT_MS = 8000;
const WS_RECONNECT_TIMEOUT_MS = 15000;

// 4403 is what the server sends when it refuses the token (onConnect returns
// false). Deliberately not 4401: in graphql-ws that means a Subscribe arrived
// before the ack — a timing race on a slow device, with a perfectly good
// session — and treating it as a bad token would sign the user out for nothing.
const WS_FORBIDDEN = 4403;
const isAuthRefusal = (event) => event?.code === WS_FORBIDDEN;

// A refusal is only believed when it repeats. The socket is opened by the
// layout's subscriptions, which mount before ProtectedRoutes has copied the
// token out of the session and into storage — so the first attempt after a
// fresh sign-in can legitimately carry no token at all. Giving up on that one
// refusal leaves the page rendered but deaf: graphql-ws stops reconnecting for
// good, every subscription is dead, and nothing short of a reload brings the
// pushes back. connectionParams is re-read on each attempt, so a retry is what
// lets a token that arrived a tick late be used.
const MAX_AUTH_REFUSALS = 3;
let _authRefusals = 0;

// A socket can die without the client being told. The machine sleeps, the WiFi
// drops, the path is cut: the server sees the connection go and the browser is
// handed nothing. The page then keeps a dashboard on screen that answers clicks
// and reports nothing — no offline screen, because as far as it knows it is
// still connected — and only a reload brings it back.
//
// Measured on two devices at once: the backend logged the disconnect at
// 09:33:11 and the next connection at 09:40:06, and in between the miner was
// restarted four times from a UI that never said a word.
//
// So the connection is made to prove itself. `keepAlive` sends a ping once the
// socket has been quiet, the server answers with a pong, and any message at all
// re-arms the watchdog below. Silence past the limit means the socket is gone
// whatever it claims: terminating it closes with 4499, which graphql-ws is
// happy to retry.
const WS_KEEPALIVE_MS = 10000;
const WS_SILENCE_LIMIT_MS = 30000;
// Uncapped, graphql-ws doubles the wait on every failed attempt — nine in a row
// and the next try is eight minutes away. On a dashboard served from the same
// LAN there is nothing to spare the backend from.
const WS_MAX_RETRY_WAIT_MS = 10000;

let _wsClient = null;
let _silenceTimer = null;

function _armSilenceWatchdog() {
  clearTimeout(_silenceTimer);
  _silenceTimer = setTimeout(() => {
    _silenceTimer = null;
    _wsClient?.terminate();
  }, WS_SILENCE_LIMIT_MS);
}

function _disarmSilenceWatchdog() {
  clearTimeout(_silenceTimer);
  _silenceTimer = null;
}

function _setWsStatus(next) {
  if (next === _wsStatus) return;
  _wsStatus = next;
  _wsStatusListeners.forEach((cb) => cb(next));
}

/**
 * Subscribe to WebSocket connection status changes.
 * Returns an unsubscribe function.
 * The callback is invoked immediately with the current status.
 */
export function subscribeWsStatus(callback) {
  _wsStatusListeners.add(callback);
  callback(_wsStatus);
  return () => _wsStatusListeners.delete(callback);
}

// Creates a WebSocket link that authenticates via connectionParams.
// Called lazily (browser-only) so it never runs during SSR.
function createWsLink() {
  _wsClient = createClient({
    url: () => getBackendUrl('/api/graphql', { ws: true }),
    // connectionParams is a function so it re-evaluates on every (re)connect,
    // picking up the latest token automatically.
    connectionParams: () => {
      const token = ls.getItem('token');
      return { authorization: token ? `Bearer ${token}` : '' };
    },
    retryAttempts: Infinity,
    keepAlive: WS_KEEPALIVE_MS,
    retryWait: (retries) =>
      new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(1000 * 2 ** retries, WS_MAX_RETRY_WAIT_MS) +
            Math.floor(Math.random() * 500)
        )
      ),
    // graphql-ws retries 4403 by default, on the theory that access might be
    // granted later. Here it will not: the same stored token goes back every
    // time, so the retry only delays sending the user to sign in.
    shouldRetry: (errOrCloseEvent) =>
      !isAuthRefusal(errOrCloseEvent) || _authRefusals < MAX_AUTH_REFUSALS,
    on: {
      connecting: () => {
        // Retries are in progress — don't touch the timer here.
        // The timer must keep ticking so it eventually fires if the backend
        // stays down through multiple retries.
      },
      // Anything arriving proves the socket is alive — a pong from our own
      // keepAlive counts, so this works on a device with nothing to push.
      message: () => {
        _armSilenceWatchdog();
      },
      connected: () => {
        // Connection (re)established — cancel any pending offline timer and go online.
        _everConnected = true;
        _authRefusals = 0;
        _armSilenceWatchdog();
        clearTimeout(_offlineTimer);
        _offlineTimer = null;
        _setWsStatus('online');
      },
      closed: (event) => {
        _disarmSilenceWatchdog();

        // A refused token is a different problem with a different remedy, and
        // no amount of waiting fixes it.
        if (isAuthRefusal(event)) {
          _authRefusals += 1;
          // A retry is on its way; say nothing yet, or a token that is one
          // tick late would send the user to sign in again.
          if (_authRefusals < MAX_AUTH_REFUSALS) return;
          clearTimeout(_offlineTimer);
          _offlineTimer = null;
          _setWsStatus('unauthorized');
          return;
        }

        // Move from 'online' → 'connecting' so the UI knows data may be stale,
        // but don't show the full offline screen yet — wait for an 'error' event
        // or for the grace-period timer to fire.
        if (_wsStatus === 'online') {
          _setWsStatus('connecting');
        }

        // Start the offline timer ONLY IF one isn't already running.
        // Subsequent 'closed' events during retries must NOT reset the timer —
        // otherwise the countdown never finishes while retries keep happening.
        if (!_offlineTimer) {
          const delay = _everConnected
            ? WS_RECONNECT_TIMEOUT_MS
            : WS_FIRST_CONNECT_TIMEOUT_MS;
          _offlineTimer = setTimeout(() => {
            _offlineTimer = null;
            _setWsStatus('offline');
          }, delay);
        }
      },
      error: () => {
        _disarmSilenceWatchdog();

        // Close events never reach here — graphql-ws routes them to `closed`,
        // and this receives the raw socket error instead.
        // The browser fires this immediately when the TCP connection is refused
        // (e.g. backend is completely down). No need to wait for a timer — show
        // the offline screen right away. If the next retry succeeds, 'connected'
        // will fire and the screen will disappear automatically.
        clearTimeout(_offlineTimer);
        _offlineTimer = null;
        _setWsStatus('offline');
      },
    },
  });

  return new GraphQLWsLink(_wsClient);
}

function createApolloClient() {
  const cache = new InMemoryCache({
    typePolicies: {
      NodeStats: {
        fields: {
          stats: {
            read(data) {
              return data;
            },
          },
        },
      },
      MinerActions: {
        merge: true,
      },
      NodeActions: {
        merge: true,
      },
      Query: {
        fields: {
          Node: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
          Mcu: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
    },
  });

  // Build the HTTP chain (used for queries and mutations)
  const httpChain = from([errorLink, authLink, momentTransformLink, httpLink]);

  // Build the link: subscriptions go through WS, everything else through HTTP.
  // wsLink is created lazily to avoid instantiating a WS connection during SSR.
  let link;
  if (typeof window !== 'undefined') {
    const wsLink = createWsLink();
    link = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
      },
      wsLink,
      httpChain
    );
  } else {
    link = httpChain;
  }

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    const data = merge(existingCache, initialState, {
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });
    _apolloClient.cache.restore(data);
  }

  if (typeof window === 'undefined') return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }
  return pageProps;
}

export function useApollo(pageProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}
