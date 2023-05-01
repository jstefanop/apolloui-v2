import * as types from './actionTypes';

export const sendFeedback = ({ message, type }) => {
  return {
    type: types.SEND_FEEDBACK,
    payload: { message, type },
  };
};

export const resetFeedback = () => {
  return {
    type: types.RESET_FEEDBACK,
  };
};
