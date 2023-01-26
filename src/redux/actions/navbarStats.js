import * as types from './actionTypes';

export const updateNavbarStats = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_NAVBAR_STATS,
    payload: { loading, error, data },
  };
};