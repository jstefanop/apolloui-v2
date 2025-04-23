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
    } else if (networkError.message === 'Failed to fetch') {
      err = `[Connection error]: Backend service is unavailable, Operation: ${operation.operationName}`;
    } else {
      err = `[Network error]: ${networkError.message}, Operation: ${operation.operationName}`;
    }
    
    // Create a serializable error object for Redux
    const serializableError = {
      message: err,
      operationName: operation.operationName,
      timestamp: new Date().toISOString()
    };
    
    // Dispatch a serializable error object
    store.dispatch(sendFeedback({ 
      message: err, 
      type: 'error',
      error: serializableError
    }));
    
    console.log(err);
  }
});

const httpLink = new HttpLink({
  uri: `http://${hostnameApi}:${portApi}/api/graphql`,
  // Add a timeout to prevent long-hanging requests
  fetchOptions: {
    timeout: 10000, // 10 seconds timeout
  },
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

// Add a utility function to check if the backend is available
export const checkBackendAvailability = async () => {
  try {
    const response = await fetch(`http://${hostnameApi}:${portApi}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health check
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    console.log('[Backend health check failed]:', error.message);
    return false;
  }
};

// Add a link to check backend availability before making requests
const healthCheckLink = new ApolloLink((operation, forward) => {
  // Skip health check for certain operations if needed
  if (operation.operationName === 'HealthCheck') {
    return forward(operation);
  }
  
  // For now, let's disable the health check to avoid the error
  // We'll implement a better solution later
  return forward(operation);
});

// Add a retry link for network errors
const retryLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    // If the response has errors, retry the operation
    if (response.errors) {
      const retryCount = operation.getContext().retryCount || 0;
      
      // Only retry up to 3 times
      if (retryCount < 3) {
        // Set the retry count in the operation context
        operation.setContext({ retryCount: retryCount + 1 });
        
        // Retry the operation after a delay
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(forward(operation));
          }, 1000 * (retryCount + 1)); // Exponential backoff
        });
      }
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

  // Add cache size monitoring
  const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
  let lastCacheSize = 0;
  let lastMemoryUsage = 0;

  const checkCacheSize = () => {
    const currentSize = JSON.stringify(cache.extract()).length;
    const memoryUsage = window.performance.memory?.usedJSHeapSize || 0;
    
    // Log detailed memory information only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Memory Usage Report:', {
        cacheSize: `${(currentSize / 1024 / 1024).toFixed(2)}MB`,
        jsHeapSize: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        cacheEntries: Object.keys(cache.extract()).length,
        timestamp: new Date().toISOString()
      });
      
      if (currentSize > MAX_CACHE_SIZE) {
        console.log(`Cache size exceeded limit (${(currentSize / 1024 / 1024).toFixed(2)}MB), performing cleanup`);
      }
      
      // Log significant changes
      if (Math.abs(currentSize - lastCacheSize) > 1024 * 1024 || 
          (memoryUsage && Math.abs(memoryUsage - lastMemoryUsage) > 50 * 1024 * 1024)) {
        console.log(`Significant change detected:
          Cache size: ${(currentSize / 1024 / 1024).toFixed(2)}MB
          JS Heap size: ${memoryUsage ? (memoryUsage / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`);
      }
    }
    
    // Always perform cleanup if needed, regardless of environment
    if (currentSize > MAX_CACHE_SIZE) {
      cache.gc();
    }
    
    lastCacheSize = currentSize;
    lastMemoryUsage = memoryUsage;
  };

  // Monitor cache size more frequently
  if (typeof window !== 'undefined') {
    setInterval(checkCacheSize, 30 * 1000); // Check every 30 seconds
  }

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([
      errorLink,
      healthCheckLink,
      retryLink,
      authLink,
      momentTransformLink,
      httpLink
    ]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
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

// Add cache cleanup function
export const cleanupApolloCache = () => {
  if (apolloClient) {
    const beforeSize = JSON.stringify(apolloClient.cache.extract()).length;
    apolloClient.cache.gc();
    const afterSize = JSON.stringify(apolloClient.cache.extract()).length;
    console.log(`Cache cleanup performed:
      Before: ${(beforeSize / 1024 / 1024).toFixed(2)}MB
      After: ${(afterSize / 1024 / 1024).toFixed(2)}MB
      Reduction: ${(((beforeSize - afterSize) / beforeSize) * 100).toFixed(2)}%`);
  }
};

// Add periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(cleanupApolloCache, 2 * 60 * 1000); // Clean cache every 2 minutes
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