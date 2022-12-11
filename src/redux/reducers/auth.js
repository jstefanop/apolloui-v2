import moment from 'moment';
import {
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNIN_SUCCESS,
  AUTH_SIGNIN_FAILURE,
  AUTH_SIGNOUT_REQUEST,
  AUTH_SIGNOUT_SUCCESS,
  AUTH_SIGNOUT_FAILURE,
} from '../actions/actionTypes';

const initialState = {
  payload: {},
  error: '',
  authState: 'LOADING',
  lastRefresh: null,
  isWaiting: false,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case AUTH_SIGNIN_REQUEST:
      return { ...initialState };
    case AUTH_SIGNIN_SUCCESS:
      return {
        ...state,
        authState: 'SIGNEDIN',
        error: initialState.error,
        payload: action.payload,
        lastRefresh: moment(),
      };
    case AUTH_SIGNIN_FAILURE:
      return {
        ...state,
        error: action.payload,
        authState: 'SIGNEDOUT',
        payload: initialState.payload,
      };
    case AUTH_SIGNOUT_REQUEST:
      return {
        ...initialState,
      };
    case AUTH_SIGNOUT_SUCCESS:
      return {
        ...state,
        error: action.payload,
        authState: 'SIGNEDOUT',
        payload: initialState.payload,
      };
    case AUTH_SIGNOUT_FAILURE:
      return {
        ...state,
        error: action.payload,
        authState: 'SIGNEDOUT',
        payload: initialState.payload,
      };
    default:
      return state;
  }
}
