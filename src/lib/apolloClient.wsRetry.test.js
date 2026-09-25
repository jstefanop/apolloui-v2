/**
 * The WebSocket refusal policy.
 *
 * A 4403 means the backend would not take the token, and the remedy is to sign
 * in again — but only once we are sure. The socket is opened by the layout's
 * subscriptions, which mount before ProtectedRoutes has copied the token out of
 * the session into storage, so the first attempt after a fresh sign-in can
 * carry no token at all. Treating that one refusal as final stops graphql-ws
 * reconnecting for good: the page stays on screen and every push dies with it,
 * which reads as "the UI does nothing" until a reload.
 */

// The module builds a real ApolloClient, so stand in for the two links and keep
// hold of the options handed to graphql-ws.
let wsOptions = null;

jest.mock('graphql-ws', () => ({
  createClient: (opts) => {
    wsOptions = opts;
    return { dispose: () => {} };
  },
}));

jest.mock('@apollo/client/link/subscriptions', () => ({
  GraphQLWsLink: class {
    constructor(client) {
      this.client = client;
    }
    request() {
      return null;
    }
  },
}));

const FORBIDDEN = { code: 4403 };
const GONE = { code: 1006 };

const load = () => {
  // HttpLink refuses to build without a fetch implementation, and jsdom has none.
  global.fetch = jest.fn();
  jest.resetModules();
  wsOptions = null;
  const mod = require('./apolloClient');
  // The WS link is created lazily on the first client build.
  mod.initializeApollo();
  return mod;
};

const statusOf = (mod) => {
  let seen = null;
  const unsubscribe = mod.subscribeWsStatus((s) => {
    seen = s;
  });
  unsubscribe();
  return seen;
};

describe('WebSocket auth refusals', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps retrying the first refusals instead of killing the socket', () => {
    load();

    wsOptions.on.closed(FORBIDDEN);
    expect(wsOptions.shouldRetry(FORBIDDEN)).toBe(true);

    wsOptions.on.closed(FORBIDDEN);
    expect(wsOptions.shouldRetry(FORBIDDEN)).toBe(true);
  });

  it('stays quiet while retries are still coming', () => {
    const mod = load();

    wsOptions.on.closed(FORBIDDEN);

    // Not 'unauthorized': announcing it here would sign the user out over a
    // token that simply had not been written yet.
    expect(statusOf(mod)).not.toBe('unauthorized');
  });

  it('gives up once the refusal has repeated', () => {
    const mod = load();

    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.closed(FORBIDDEN);

    expect(statusOf(mod)).toBe('unauthorized');
    expect(wsOptions.shouldRetry(FORBIDDEN)).toBe(false);
  });

  it('forgets earlier refusals once a connection succeeds', () => {
    load();

    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.connected();
    wsOptions.on.closed(FORBIDDEN);

    expect(wsOptions.shouldRetry(FORBIDDEN)).toBe(true);
  });

  it('always retries a close that is not a refusal', () => {
    load();

    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.closed(FORBIDDEN);
    wsOptions.on.closed(FORBIDDEN);

    expect(wsOptions.shouldRetry(GONE)).toBe(true);
  });
});
