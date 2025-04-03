import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    updateServicesStatus: (state, action) => {
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
  },
});

export const { updateServicesStatus } = servicesSlice.actions;
export default servicesSlice.reducer;