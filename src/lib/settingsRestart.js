// What a settings save has to restart.
//
// Pulled out of the settings page because it is the one decision there that has
// been wrong in both directions. The flag is not just the button's label — it is
// also what performs the stop/start after saving — so the two failures are:
//
//   promising a restart that cannot happen (no drive, so the node is down and
//   staying down: "Save & Restart" runs a start systemd refuses)
//   skipping one that must (the storage probe can call a drive unusable while
//   bitcoind is running fine; the save then reports success and applies nothing)
//
// Both are avoided by asking whether there is a node to restart rather than
// whether the drive looks good: a running node is restarted whatever the probe
// says, and a node that is down with nowhere to live is left alone.

export const nodeRestartNeeded = ({ fieldsChanged, nodeRunning, storageUsable }) =>
  !!fieldsChanged && (!!nodeRunning || storageUsable !== false);

export const restartTypeFor = ({ miner, solo, node }) => {
  if ((miner || solo) && node) return 'both';
  if (miner) return 'miner';
  if (solo) return 'solo';
  if (node) return 'node';
  return null;
};
