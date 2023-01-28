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

    const { error } = nodeStats;

    const errors = [...[nodeError, error, errorStats].filter(Boolean)];

    let stats;
    if (!errors.length && nodeStats) {
      const {
        timestamp,
        blockchainInfo: { blocks, blockTime, headers, sizeOnDisk },
        connectionCount,
        miningInfo: { difficulty, networkhashps },
        peerInfo,
        networkInfo: { version, subversion },
        error,
      } = nodeStats;

      stats = {
        timestamp,
        blocksCount: blocks,
        blockTime,
        blockHeader: headers,
        sizeOnDisk,
        connectionCount,
        error,
        difficulty,
        networkhashps,
        peerInfo,
        version,
        subversion,
      };
    }

    return {
      loading: nodeLoading,
      error: errors,
      data: !errors.length && stats,
    };
  }
);
