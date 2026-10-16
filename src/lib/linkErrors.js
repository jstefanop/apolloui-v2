import { sendFeedback } from '../redux/slices/feedbackSlice';
import { isUnauthenticated } from './authRefusal';
import { serviceFailureId } from './callFailure';

// What the user is told about a failed operation.
//
// GraphQL errors are the server answering "no" with a reason written for the
// user, so the reason alone is shown (feedback dedupes repeats). Transport
// failures (offline, timeout) are not toasted: BackendOfflineScreen already owns
// that state, and a toast per polled operation would bury it. They are still
// logged. An unauthenticated error is not toasted either: an expired token is
// handled by the session flow (authRefusal.js, ProtectedRoutes), and a toast on
// top of that redirect would just flash.
export const reportLinkErrors = (
  { graphQLErrors, networkError, operation },
  dispatch,
  onUnauthenticated
) => {
  const name = operation?.operationName;
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, extensions }) => {
      console.log(`[GraphQL error]: Message: ${message}, Operation: ${name}`);
      if (isUnauthenticated({ extensions })) {
        onUnauthenticated?.(operation);
        return;
      }
      // A caller that shows the failure itself (an inline form alert) opts out of
      // the toast with `context: { silentErrors: true }`: the same text twice,
      // one above the other, is noise.
      if (message && !operation?.getContext?.().silentErrors)
        dispatch(sendFeedback({ message, messageId: serviceFailureId({ extensions }), type: 'error' }));
    });
  if (networkError) {
    if (networkError.message === 'Timeout exceeded') {
      console.log(`[Timeout error]: Operation: ${name}`);
    } else if (networkError.message === 'Failed to fetch') {
      console.log(`[Connection error]: Backend service is unavailable, Operation: ${name}`);
    } else {
      console.log(`[Network error]: ${networkError.message}, Operation: ${name}`);
    }
  }
};
