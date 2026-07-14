import { createSelector } from 'reselect';

const nodeDataSelector = (state) => state.node.data;
const nodeErrorSelector = (state) => state.node.error;
const nodeLoadingSelector = (state) => state.node.loading;
const nodeLastKnownDataSelector = (state) => state.node.lastKnownData;

// Returns true for transient errors that should not clear the UI (timeouts, RPC warmup)
function isTransientError(err) {
  if (!err) return false;
  const msg = err.message || '';
  const code = err.code;
  return (
    msg.includes('timed out') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ECONNRESET') ||
    code === -28 ||
    code === '-28'
  );
}

// Build display stats from raw nodeStats object
function buildNodeStats(nodeStats) {
  if (!nodeStats) return null;
  try {
    const blockchainInfo = nodeStats?.blockchainInfo || {};
    const miningInfo = nodeStats?.miningInfo || {};
    const networkInfo = nodeStats?.networkInfo || {};
    return {
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
    return null;
  }
}

function processNodeError(nodeError) {
  if (!nodeError) return null;
  if (typeof nodeError === 'object' && !Array.isArray(nodeError) && nodeError.data?.error) {
    return {
      ...nodeError,
      message: nodeError.data.error.message || nodeError.message,
      code: nodeError.data.error.code || nodeError.code,
      data: nodeError.data,
    };
  }
  return nodeError;
}

export const nodeSelector = createSelector(
  nodeDataSelector,
  nodeErrorSelector,
  nodeLoadingSelector,
  nodeLastKnownDataSelector,
  (nodeData, nodeError, nodeLoading, lastKnownData) => {
    const processedNodeError = processNodeError(nodeError);

    // Handle null or undefined nodeData (subscription-level error)
    if (!nodeData) {
      const errors = [processedNodeError].filter(Boolean);

      // All errors are transient → fall back to last known data silently
      if (errors.length > 0 && errors.every(isTransientError) && lastKnownData) {
        const lastStats = buildNodeStats(lastKnownData?.Node?.stats?.result?.stats);
        if (lastStats) {
          return { loading: nodeLoading, error: [], data: { ...lastStats, stale: true } };
        }
      }

      return { loading: nodeLoading, error: errors, data: null };
    }

    // Safely extract values using optional chaining
    const errorStats = nodeData?.Node?.stats?.error;
    const result = nodeData?.Node?.stats?.result;
    const nodeStats = result?.stats || {};
    const error = nodeStats?.error;

    // Filter out null/undefined errors
    const errors = [...[processedNodeError, error, errorStats].filter(Boolean)];

    let stats = null;
    // Only process data if we have valid nodeStats and no errors
    if (nodeStats && !errors.length) {
      stats = buildNodeStats(nodeStats);
      if (!stats) {
        return {
          loading: nodeLoading,
          error: [...errors, { message: 'Error processing node data' }],
          data: null,
        };
      }
    }

    // Errors present — check if they're all transient
    if (errors.length > 0) {
      if (errors.every(isTransientError) && lastKnownData) {
        const lastStats = buildNodeStats(lastKnownData?.Node?.stats?.result?.stats);
        if (lastStats) {
          return { loading: nodeLoading, error: [], data: { ...lastStats, stale: true } };
        }
      }
      return { loading: nodeLoading, error: errors, data: null };
    }

    return { loading: nodeLoading, error: [], data: stats };
  }
);
