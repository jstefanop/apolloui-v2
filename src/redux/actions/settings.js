import * as types from './actionTypes';

export const updateSettings = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_SETTINGS,
    payload: { loading, error, data },
  };
};