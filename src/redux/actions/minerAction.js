import * as types from './actionTypes';

export const updateMinerAction = ({ loading, error, data, timestamp, status }) => {
  return {
    type: types.UPDATE_MINER_ACTION,
    payload: { loading, error, data, timestamp, status },
  };
};