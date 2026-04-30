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
// In the browser we always derive the host from window.location.hostname at
// request time so every device automatically targets the interface it used to
// open the UI — works correctly when both WiFi and Ethernet are active.
const ssrHostname = process.env.NEXT_PUBLIC_GRAPHQL_HOST || os.hostname();
const portApi = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 5000;

const getApiHost = () =>
  typeof window !== 'undefined' ? window.location.hostname : ssrHostname;

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
  uri: () => `http://${getApiHost()}:${portApi}/api/graphql`,
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
    const response = await fetch(`http://${getApiHost()}:${portApi}/health`, {
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
// Status values: 'connecting' | 'online' | 'offline'
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
  return new GraphQLWsLink(
    createClient({
      url: () => `ws://${getApiHost()}:${portApi}/api/graphql`,
      // connectionParams is a function so it re-evaluates on every (re)connect,
      // picking up the latest token automatically.
      connectionParams: () => {
        const token = ls.getItem('token');
        return { authorization: token ? `Bearer ${token}` : '' };
      },
      retryAttempts: Infinity,
      shouldRetry: () => true,
      on: {
        connecting: () => {
          // Retries are in progress — don't touch the timer here.
          // The timer must keep ticking so it eventually fires if the backend
          // stays down through multiple retries.
        },
        connected: () => {
          // Connection (re)established — cancel any pending offline timer and go online.
          _everConnected = true;
          clearTimeout(_offlineTimer);
          _offlineTimer = null;
          _setWsStatus('online');
        },
        closed: () => {
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
          // The browser fires this immediately when the TCP connection is refused
          // (e.g. backend is completely down). No need to wait for a timer — show
          // the offline screen right away. If the next retry succeeds, 'connected'
          // will fire and the screen will disappear automatically.
          clearTimeout(_offlineTimer);
          _offlineTimer = null;
          _setWsStatus('offline');
        },
      },
    })
  );
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
