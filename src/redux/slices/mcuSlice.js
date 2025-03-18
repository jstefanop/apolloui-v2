import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const mcuSlice = createSlice({
  name: 'mcu',
  initialState,
  reducers: {
    updateMcuStats: (state, action) => {
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
    },
  },
});

export const { updateMcuStats } = mcuSlice.actions;
export default mcuSlice.reducer;