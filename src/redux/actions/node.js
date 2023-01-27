import * as types from './actionTypes';

export const updateNodeStats = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_NODE_STATS,
    payload: { loading, error, data },
  };
};