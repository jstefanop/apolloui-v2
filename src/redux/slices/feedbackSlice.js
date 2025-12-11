import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: null,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    sendFeedback: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    resetFeedback: (state) => {
      state.message = null;
      state.type = null;
    },
  },
});

export const { sendFeedback, resetFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;