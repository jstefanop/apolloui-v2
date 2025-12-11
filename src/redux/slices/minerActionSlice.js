import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  status: false,
  timestamp: null,
};

const minerActionSlice = createSlice({
  name: 'minerAction',
  initialState,
  reducers: {
    updateMinerAction: (state, action) => {
      state.data = !action.payload.error && action.payload.data;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
      state.status = action.payload.status;
      state.timestamp = action.payload.timestamp;
    },
  },
});

export const { updateMinerAction } = minerActionSlice.actions;
export default minerActionSlice.reducer;