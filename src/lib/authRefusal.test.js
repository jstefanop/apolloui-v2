import { createAuthRefusalHandler, isUnauthenticated } from './authRefusal';

const setup = (tokens) => {
  let i = 0;
  const deps = {
    getToken: jest.fn(() => tokens[Math.min(i++, tokens.length - 1)]),
    endSession: jest.fn().mockResolvedValue(),
    clearToken: jest.fn(),
    refetch: jest.fn().mockResolvedValue(),
    graceMs: 1000,
  };
  return { deps, handle: createAuthRefusalHandler(deps) };
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('isUnauthenticated', () => {
  it('knows the backend error by code or by message', () => {
    expect(isUnauthenticated({ extensions: { code: 'UNAUTHENTICATED' } })).toBe(true);
    expect(isUnauthenticated({ message: 'You must be authenticated to access this resource' })).toBe(true);
    expect(isUnauthenticated({ message: 'Duplicate input name' })).toBe(false);
  });
});

describe('an HTTP read refused for its token', () => {
  it('ends the session and clears the token when the same token is still refused', async () => {
    const { deps, handle } = setup(['bad']);
    handle('bad');
    expect(deps.endSession).not.toHaveBeenCalled(); // waits out the grace period
    await jest.advanceTimersByTimeAsync(1000);
    expect(deps.endSession).toHaveBeenCalledTimes(1);
    expect(deps.clearToken).toHaveBeenCalledTimes(1);
    expect(deps.refetch).not.toHaveBeenCalled();
  });

  it('does not sign out when the stored token changed meanwhile: rereads instead', async () => {
    const { deps, handle } = setup(['good']);
    handle('stale');
    await jest.advanceTimersByTimeAsync(1000);
    expect(deps.endSession).not.toHaveBeenCalled();
    expect(deps.refetch).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there never was a token', async () => {
    const { deps, handle } = setup(['']);
    handle('');
    await jest.advanceTimersByTimeAsync(1000);
    expect(deps.endSession).not.toHaveBeenCalled();
  });

  it('a burst of refusals ends the session once', async () => {
    const { deps, handle } = setup(['bad']);
    handle('bad');
    handle('bad');
    handle('bad');
    await jest.advanceTimersByTimeAsync(1000);
    expect(deps.endSession).toHaveBeenCalledTimes(1);
  });
});
