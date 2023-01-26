import * as types from './actionTypes';

export const updateMinerAction = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_MINER_ACTION,
    payload: { loading, error, data },
  };
};

export const resetMinerAction = () => {
  return {
    type: types.RESET_MINER_ACTION
  };
};