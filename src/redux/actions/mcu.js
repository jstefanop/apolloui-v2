import * as types from './actionTypes';

export const updateMcuStats = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_MCU_STATS,
    payload: { loading, error, data },
  };
};