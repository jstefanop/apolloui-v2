import { SEND_FEEDBACK } from './actions/actionTypes';
import { resetFeedback } from './actions/feedback';

const feedbackMiddleware = ({ dispatch }) => (next) => (action) => {
  if (action.type === SEND_FEEDBACK) {
    next(action);

    setTimeout(() => {
      dispatch(resetFeedback());
    }, 10000);
  } else {
    next(action);
  }
};

export default feedbackMiddleware;