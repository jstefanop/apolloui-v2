import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    updateNodeStats: (state, action) => {
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
  },
});

export const { updateNodeStats } = nodeSlice.actions;
export default nodeSlice.reducer;