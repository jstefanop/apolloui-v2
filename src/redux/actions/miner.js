import * as types from './actionTypes';

export const updateMinerStats = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_MINER_STATS,
    payload: { loading, error, data },
  };
};