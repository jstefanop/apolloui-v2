import { createSlice } from '@reduxjs/toolkit';

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
      state.error = action.payload.error;
    },
  },
});

export const { updateNodeStats } = nodeSlice.actions;
export default nodeSlice.reducer;