import * as types from './actionTypes';

export const updateWifi = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_WIFI,
    payload: { loading, error, data },
  };
};