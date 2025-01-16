import * as types from './actionTypes';

export const updateServicesStatus = ({ loading, error, data }) => {
  return {
    type: types.UPDATE_SERVICES_STATUS,
    payload: { loading, error, data },
  };
};