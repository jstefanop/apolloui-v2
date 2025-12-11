import { createSelector } from 'reselect';
import { initialState } from '../../graphql/node';

const nodeDataSelector = (state) => state.node.data;
const nodeErrorSelector = (state) => state.node.error;
const nodeLoadingSelector = (state) => state.node.loading;

export const nodeSelector = createSelector(
  nodeDataSelector,
  nodeErrorSelector,
  nodeLoadingSelector,
  (nodeData, nodeError, nodeLoading) => {
    // Handle null or undefined nodeData
    if (!nodeData) {
      // Check if nodeError has data.error structure
      let processedError = nodeError;
      if (nodeError && typeof nodeError === 'object' && !Array.isArray(nodeError) && nodeError.data?.error) {
        processedError = {
          ...nodeError,
          message: nodeError.data.error.message || nodeError.message,
          code: nodeError.data.error.code || nodeError.code,
          data: nodeError.data,
        };
      }
      return {
        loading: nodeLoading,
        error: [processedError].filter(Boolean),
        data: null,
      };
    }

    // Safely extract values using optional chaining
    const errorStats = nodeData?.Node?.stats?.error;
    const result = nodeData?.Node?.stats?.result;
    const nodeStats = result?.stats || {};
    const error = nodeStats?.error;

    // Process nodeError to extract data.error if present
    let processedNodeError = nodeError;
    if (nodeError && typeof nodeError === 'object' && !Array.isArray(nodeError) && nodeError.data?.error) {
      processedNodeError = {
        ...nodeError,
        message: nodeError.data.error.message || nodeError.message,
        code: nodeError.data.error.code || nodeError.code,
        data: nodeError.data,
      };
    }

    // Filter out null/undefined errors
    const errors = [...[processedNodeError, error, errorStats].filter(Boolean)];

    let stats = null;
    // Only process data if we have valid nodeStats and no errors
    if (nodeStats && !errors.length) {
      try {
        // Use optional chaining for deep properties to avoid undefined errors
        const blockchainInfo = nodeStats?.blockchainInfo || {};
        const miningInfo = nodeStats?.miningInfo || {};
        const networkInfo = nodeStats?.networkInfo || {};

        stats = {
          timestamp: nodeStats.timestamp,
          blocksCount: blockchainInfo.blocks,
          blockTime: blockchainInfo.blockTime,
          blockHeader: blockchainInfo.headers,
          sizeOnDisk: blockchainInfo.sizeOnDisk,
          verificationProgress: blockchainInfo.verificationprogress,
          connectionCount: nodeStats.connectionCount,
          error: nodeStats.error,
          difficulty: miningInfo?.difficulty,
          networkhashps: miningInfo?.networkhashps,
          peerInfo: nodeStats.peerInfo || [],
          version: networkInfo?.version,
          subversion: networkInfo?.subversion,
          localaddresses: networkInfo?.localaddresses || [],
          connectionsIn: networkInfo?.connections_in,
          connectionsOut: networkInfo?.connections_out,
        };
      } catch (e) {
        // If something goes wrong during extraction, log it and return null
        console.error('Error processing node data:', e);
        return {
          loading: nodeLoading,
          error: [...errors, { message: 'Error processing node data' }],
          data: null,
        };
      }
    }

    return {
      loading: nodeLoading,
      error: errors,
      data: errors.length === 0 ? stats : null,
    };
  }
);
