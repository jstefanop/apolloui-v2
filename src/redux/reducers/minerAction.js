import {
  UPDATE_MINER_ACTION,
  RESET_MINER_ACTION,
} from '../actions/actionTypes';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_MINER_ACTION:
      return {
        ...state,
        data: !action.payload.error && action.payload.data,
        loading: action.payload.loading,
        error: action.payload.error,
      };
    case RESET_MINER_ACTION:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
