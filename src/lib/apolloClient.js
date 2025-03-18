import { useMemo } from 'react';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  from,
  InMemoryCache,
} from '@apollo/client';
import os from 'os';
import { onError } from '@apollo/client/link/error';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { sendFeedback, resetFeedback } from '../redux/slices/feedbackSlice';
import { store } from '../redux/store';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

const ls = typeof window !== 'undefined' ? localStorage : {};

const hostnameApi = process.env.NEXT_PUBLIC_GRAPHQL_HOST || os.hostname();
const portApi = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 5000;

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
    // Skip handling special objects that could cause circular references
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
    } else {
      err = `[Network error]: ${networkError.message}, Operation: ${operation.operationName}`;
    }
    //store.dispatch(sendFeedback({ message: err, type: 'error' }));
    console.log(err);
  }
});

const httpLink = new HttpLink({
  uri: `http://${hostnameApi}:${portApi}/api/graphql`,
});

const authLink = new ApolloLink((operation, forward) => {
  // Retrieve the authorization token from local storage.
  const token = ls.getItem('token');

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  // Call the next link in the middleware chain.
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
      MinerStatsResult: {
        fields: {
          stats: {
            read(data) {
              return data.map((board) => {
                if (!board.pool) return board;

                let boardStatus = true;
                let poolStatus = true;

                const sharesSent = board.pool.intervals.int_0.sharesSent;
                const shareTime = moment(board.date);
                let storedBoard = ls.getItem(`board_${board.uuid}`);
                if (storedBoard) storedBoard = JSON.parse(storedBoard);

                const interval = moment.duration(moment().diff(shareTime));
                const maxStatusInterval =
                  process.env.NEXT_PUBLIC_ENV === 'development' ? 10 : 1;

                if (interval.asMinutes() > maxStatusInterval) {
                  boardStatus = false;
                  poolStatus = false;
                }

                let lastsharetime = storedBoard ? storedBoard.date : shareTime;

                if (!storedBoard || storedBoard.sent !== sharesSent) {
                  ls.setItem(
                    `board_${board.uuid}`,
                    JSON.stringify({
                      date: shareTime,
                      sent: sharesSent,
                    })
                  );
                  lastsharetime = shareTime;
                }

                return {
                  ...board,
                  status: boardStatus,
                  lastsharetime,
                  date: moment(board.date).format(),
                  pool: {
                    ...board.pool,
                    status: poolStatus,
                  },
                };
              });
            },
          },
        },
      },
      Query: {
        fields: {
          Node: {
            merge(existing, incoming) {
              return {
                ...existing,
                ...incoming,
              };
            },
          },
          Mcu: {
            merge(existing, incoming) {
              return {
                ...existing,
                ...incoming,
              };
            },
          },
        },
      },
    },
  });

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([
      errorLink,
      authLink,
      momentTransformLink,
      httpLink
    ]),
    cache,
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
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