import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const wifiSlice = createSlice({
  name: 'wifi',
  initialState,
  reducers: {
    updateWifi: (state, action) => {
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
    },
  },
});

export const { updateWifi } = wifiSlice.actions;
export default wifiSlice.reducer;