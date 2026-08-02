import { createTransform } from 'redux-persist';

// Has the device ever answered? `data: null` alone cannot say: it means both
// "nothing has arrived yet" (normal for the first seconds after a reload — the
// stats come over a WebSocket push, not a request) and "answered with nothing".
// Read as the latter, every page rendered its content with empty values before
// the first push landed, which is the flash of blank cards on reload.
//
// Every domain slice carries a `received` flag for this, and every selector
// folds it into `loading` so consumers need no change. Both live here so that
// changing what counts as an answer is one edit, not one per domain.

// An answer is data or a genuine error; a bare loading tick is neither.
export const markAnswered = (state, payload) => {
  if (payload?.data != null || payload?.error != null) {
    state.received = true;
  }
};

// Consumers branch on loading to show a skeleton, and that now covers
// "never answered" too.
export const loadingUntilAnswered = (slice) =>
  slice.loading || !slice.received;

// `received` answers "has the device answered in THIS session?", so it must not
// survive a reload. Persisted slices (store.js whitelist) would otherwise
// rehydrate as already answered, and the page would present the previous
// session's stats as current until the first push replaces them.
export const resetReceivedOnRehydrate = createTransform(
  (inboundState) => inboundState,
  (outboundState) =>
    outboundState &&
    typeof outboundState === 'object' &&
    'received' in outboundState
      ? { ...outboundState, received: false }
      : outboundState
);
