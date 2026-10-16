import { createSlice } from '@reduxjs/toolkit';

// `seq` counts every sendFeedback ever dispatched. The slice holds one message at
// a time and an identical resend leaves message/type unchanged, so without a
// counter a consumer cannot tell "the same error again" from "nothing new": a
// retried save that fails the same way twice would stay silent the second time.
const initialState = {
  message: null,
  type: null,
  // Optional label a sender can attach (see StatusTransitionFeedback).
  tag: null,
  seq: 0,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    sendFeedback: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.tag = action.payload.tag ?? null;
      state.seq += 1;
    },
    // Clears the text but keeps seq: it must stay monotonic.
    resetFeedback: (state) => {
      state.message = null;
      state.type = null;
      state.tag = null;
    },
  },
});

export const { sendFeedback, resetFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
