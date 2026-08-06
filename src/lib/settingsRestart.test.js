import { nodeRestartNeeded, restartTypeFor } from './settingsRestart';

describe('nodeRestartNeeded', () => {
  it('is false when nothing on the node changed', () => {
    expect(
      nodeRestartNeeded({ fieldsChanged: false, nodeRunning: true, storageUsable: true })
    ).toBe(false);
  });

  it('restarts when the drive is fine', () => {
    expect(
      nodeRestartNeeded({ fieldsChanged: true, nodeRunning: false, storageUsable: true })
    ).toBe(true);
  });

  // The user-facing half: with no drive the node is down and systemd will refuse
  // to start it, so "Save & Restart" would promise a restart that cannot happen.
  it('does not promise a restart for a down node with nowhere to live', () => {
    expect(
      nodeRestartNeeded({ fieldsChanged: true, nodeRunning: false, storageUsable: false })
    ).toBe(false);
  });

  // The dangerous half: the probe can be wrong. A node that is actually running
  // must be restarted, or the save reports success and applies nothing.
  it('restarts a running node whatever the probe says about the drive', () => {
    expect(
      nodeRestartNeeded({ fieldsChanged: true, nodeRunning: true, storageUsable: false })
    ).toBe(true);
  });

  // Before the device has answered, storage is unknown — not "no drive".
  it('restarts while the storage answer is still unknown', () => {
    expect(
      nodeRestartNeeded({ fieldsChanged: true, nodeRunning: false, storageUsable: null })
    ).toBe(true);
  });
});

describe('restartTypeFor', () => {
  it.each([
    [{ miner: false, solo: false, node: false }, null],
    [{ miner: true, solo: false, node: false }, 'miner'],
    [{ miner: false, solo: true, node: false }, 'solo'],
    [{ miner: false, solo: false, node: true }, 'node'],
    [{ miner: true, solo: false, node: true }, 'both'],
    [{ miner: false, solo: true, node: true }, 'both'],
  ])('%o -> %s', (input, expected) => {
    expect(restartTypeFor(input)).toBe(expected);
  });
});
