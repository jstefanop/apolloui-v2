import { createSlice } from '@reduxjs/toolkit';
import { markAnswered } from '../utils/answered';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  // Set by markAnswered(); see redux/utils/answered.js for why `data: null`
  // cannot stand in for it.
  received: false,
  lastKnownData: null, // preserved through transient errors (timeouts, warmup)
  loading: false,
  error: null,
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    updateNodeStats: (state, action) => {
      markAnswered(state, action.payload);
      const incoming = action.payload.data;
      state.data = incoming;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);

      // Only update lastKnownData when we have valid stats with no RPC error
      const nodeStats = incoming?.Node?.stats?.result?.stats;
      if (nodeStats && !nodeStats.error) {
        state.lastKnownData = incoming;
      }
    },
  },
});

export const { updateNodeStats } = nodeSlice.actions;
export default nodeSlice.reducer;