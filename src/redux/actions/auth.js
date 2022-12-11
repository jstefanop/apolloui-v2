import * as types from './actionTypes';

export function getAuthState(payload) {
  return {
    type: types.GET_AUTH_STATE,
    payload,
  };
}

export function signinRequest(payload) {
  return {
    type: types.AUTH_SIGNIN_REQUEST,
    payload,
  };
}

export function signinSuccess(payload) {
  return {
    type: types.AUTH_SIGNIN_SUCCESS,
    payload,
  };
}

export function signinFailure(payload) {
  return {
    type: types.AUTH_SIGNIN_FAILURE,
    payload,
  };
}

export function signoutRequest() {
  return {
    type: types.AUTH_SIGNOUT_REQUEST,
  };
}

export function signoutSuccess() {
  return {
    type: types.AUTH_SIGNOUT_SUCCESS,
  };
}

export function signoutFailure(error) {
  return {
    type: types.AUTH_SIGNOUT_FAILURE,
    error,
  };
}