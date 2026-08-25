import { createSelector } from 'reselect';
import { loadingUntilAnswered } from '../utils/answered';

const nodeDataSelector = (state) => state.node.data;
const nodeErrorSelector = (state) => state.node.error;
const nodeLoadingSelector = (state) => loadingUntilAnswered(state.node);
const nodeLastKnownDataSelector = (state) => state.node.lastKnownData;

// What the service monitor says about bitcoind. This is the bound on the
// fallback below: the UI already knows, from systemd, whether the node is even
// supposed to be running.
const nodeServiceStatusSelector = (state) =>
  state.services?.data?.Services?.stats?.result?.data?.find?.(
    (s) => s.serviceName === 'node'
  )?.status ?? null;

// Returns true for transient errors that should not clear the UI (timeouts, RPC warmup)
//
// ECONNREFUSED belongs here because bitcoind refuses RPC for the first minute
// after it starts. But it is also what a node that will NEVER start answers —
// no drive to put a blockchain on, or simply stopped — and then nothing here
// expires: see keepLastKnown() for the bound.
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

// Whether to keep showing the last good stats through an error.
//
// The errors that justify it are the ones a running node produces while it is
// busy: without this the dashboard blanks every time bitcoind restarts. What it
// must not do is outlive the node itself — an Apollo with no SSD refuses the
// connection forever, and the Overview went on showing the block height from
// before the shutdown, with no error and no sign it was frozen.
//
// systemd is the arbiter. `offline` here is a unit that is stopped or was
// skipped for want of a drive; during warmup the unit is active, so the
// fallback still applies exactly where it was meant to.
function keepLastKnown(errors, lastKnownData, nodeServiceStatus) {
  if (!errors.length || !errors.every(isTransientError)) return false;
  if (!lastKnownData) return false;
  return nodeServiceStatus !== 'offline';
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
  nodeServiceStatusSelector,
  (nodeData, nodeError, nodeLoading, lastKnownData, nodeServiceStatus) => {
    const processedNodeError = processNodeError(nodeError);

    // Handle null or undefined nodeData (subscription-level error)
    if (!nodeData) {
      const errors = [processedNodeError].filter(Boolean);

      // All errors are transient, and the node is still meant to be up → fall
      // back to last known data silently
      if (keepLastKnown(errors, lastKnownData, nodeServiceStatus)) {
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
      if (keepLastKnown(errors, lastKnownData, nodeServiceStatus)) {
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
