// A token the backend refuses over HTTP.
//
// The WebSocket has its own path for this (3 refusals, then Default.js ends the
// session). A page that only reads over HTTP never opens that road to the end:
// it showed the raw ApolloError and stayed there, signed in to nothing.
//
// But a refusal is not always a bad session. The first requests of a page go out
// before ProtectedRoutes has copied the session's token into storage, so a stale
// or empty stored token is refused and then replaced a moment later. Ending the
// session on that first refusal signs out people whose session is fine. So the
// verdict waits `graceMs`, and looks at the token again:
//   - changed since the refused request: it was the race. Reread what failed.
//   - same token: it really is refused. End the session; ProtectedRoutes sees it
//     gone and sends the user to sign in.
// No token at all, before and after, means there is nothing to end (this is the
// sign-in page, or a signed-out one).

export const isUnauthenticated = (error) =>
  error?.extensions?.code === 'UNAUTHENTICATED' ||
  /authenticated/.test(error?.message || '');

export const createAuthRefusalHandler = ({
  getToken,
  endSession,
  clearToken,
  refetch,
  graceMs = 1500,
}) => {
  let pending = false;

  return (tokenUsed) => {
    if (pending) return;
    pending = true;
    setTimeout(async () => {
      try {
        const now = getToken();
        if (now && now !== tokenUsed) {
          await refetch?.();
          return;
        }
        if (!now && !tokenUsed) return;
        await endSession();
        clearToken();
      } catch {
        // Nothing sensible to do: the next refusal tries again.
      } finally {
        pending = false;
      }
    }, graceMs);
  };
};
