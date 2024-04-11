import * as types from './actionTypes';

export const updateAnalytics = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_ANALYTICS,
    payload: { loading, error, data },
  };
};