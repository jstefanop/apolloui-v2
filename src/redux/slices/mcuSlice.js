import { createSlice } from '@reduxjs/toolkit';
import { markAnswered } from '../utils/answered';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  // Set by markAnswered(); see redux/utils/answered.js for why `data: null`
  // cannot stand in for it.
  received: false,
  loading: false,
  error: null,
};

const mcuSlice = createSlice({
  name: 'mcu',
  initialState,
  reducers: {
    updateMcuStats: (state, action) => {
      markAnswered(state, action.payload);
      state.data = action.payload.data;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
  },
});

export const { updateMcuStats } = mcuSlice.actions;
export default mcuSlice.reducer;