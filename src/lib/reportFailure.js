import { callFailure, serviceFailureIdOf } from './callFailure';
import { sendFeedback } from '../redux/slices/feedbackSlice';

// Tell the user about a call that failed, in their language when the backend
// said which service action it was. For the buttons that fire a call and used to
// ignore how it ended. Returns true when it failed.
export const reportFailure = (dispatch, result) => {
  const failure = callFailure(result);
  if (!failure) return false;
  dispatch(sendFeedback({ message: failure, messageId: serviceFailureIdOf(result), type: 'error' }));
  return true;
};
