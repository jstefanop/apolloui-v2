import {
  SEND_FEEDBACK,
  RESET_FEEDBACK,
} from '../actions/actionTypes';

const initialState = {
  message: null,
  type: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_FEEDBACK:
      return {
        ...state,
        message: action.payload.message,
        type: action.payload.type,
      };
    case RESET_FEEDBACK:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
