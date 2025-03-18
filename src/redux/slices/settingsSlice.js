import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;