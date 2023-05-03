import { UPDATE_WIFI } from '../actions/actionTypes';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_WIFI:
      return {
        ...state,
        data: action.payload.data,
        loading: action.payload.loading,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default reducer;
