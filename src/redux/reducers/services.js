import { UPDATE_SERVICES_STATUS } from '../actions/actionTypes';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SERVICES_STATUS:
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
