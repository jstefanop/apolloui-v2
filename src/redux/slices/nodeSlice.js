import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  lastKnownData: null, // preserved through transient errors (timeouts, warmup)
  loading: false,
  error: null,
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    updateNodeStats: (state, action) => {
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