import * as types from './actionTypes';

export const updateGraphqlErrors = ({ error }) => {
  return {
    type: types.UPDATE_GRAPHQL_ERRORS,
    payload: { error },
  };
};

export const resetGraphqlErrors = () => {
  return {
    type: types.RESET_GRAPHQL_ERRORS,
  };
};
