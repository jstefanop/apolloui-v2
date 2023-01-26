import {
  UPDATE_GRAPHQL_ERRORS,
  RESET_GRAPHQL_ERRORS,
} from '../actions/actionTypes';

const initialState = {
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_GRAPHQL_ERRORS:
      return {
        ...state,
        error: action.payload.error,
      };
    case RESET_GRAPHQL_ERRORS:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
