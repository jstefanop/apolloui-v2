import { createSelector } from 'reselect';
import { initialState } from '../../graphql/node';

const nodeDataSelector = (state) => state.node.data;
const nodeErrorSelector = (state) => state.node.error;
const nodeLoadingSelector = (state) => state.node.loading;

export const nodeSelector = createSelector(
  [nodeDataSelector, nodeErrorSelector, nodeLoadingSelector],
  (nodeData, nodeError, nodeLoading) => {
    const {
      Node: {
        stats: {
          error: errorStats,
          result: { stats: nodeStats },
        },
      },
    } = nodeData || initialState;

    const errors = [
      ...[nodeError, errorStats].filter(Boolean),
    ];

    return {
      loading: nodeLoading,
      error: errors,
      data: !errors.length && nodeStats,
    };
  }
);
