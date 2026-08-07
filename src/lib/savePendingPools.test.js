import { savePendingPools } from './savePendingPools';

// Where the two features that were built apart finally meet: saving pool
// profiles, and restarting services according to what the node's storage
// allows. They share one handler, and neither branch's review ever saw them
// together. What matters here is not that each is right on its own — that is
// tested elsewhere — but that one cannot silently swallow the other.

const settings = {
  pool: { url: 'stratum+tcp://a:1', username: 'w1', password: 'p1' },
  backupPool: { url: 'stratum+tcp://b:2', username: 'w2', password: 'p2' },
};

const both = { primary: true, backup: true };
const wanted = { enabled: true, name: '' };
const idle = { enabled: false, name: '' };

const run = (over = {}) =>
  savePendingPools({
    pending: { primary: idle, backup: idle },
    settings,
    offered: both,
    profiles: [],
    save: jest.fn().mockResolvedValue({ ok: true, profile: { name: 'kept' } }),
    suggestName: (url) => url,
    onSaved: (profile) => ({ message: `saved ${profile?.name}`, type: 'success' }),
    onFailed: (message) => ({ message, type: 'error' }),
    ...over,
  });

describe('savePendingPools', () => {
  it('keeps only the pools that were asked for', async () => {
    const save = jest.fn().mockResolvedValue({ ok: true, profile: { name: 'kept' } });
    await run({ pending: { primary: wanted, backup: idle }, save });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ url: 'stratum+tcp://a:1' }));
  });

  it('keeps each section from its own pool', async () => {
    const save = jest.fn().mockResolvedValue({ ok: true, profile: { name: 'kept' } });
    await run({ pending: { primary: wanted, backup: wanted }, save });

    expect(save.mock.calls.map(([input]) => input.url)).toEqual([
      'stratum+tcp://a:1',
      'stratum+tcp://b:2',
    ]);
  });

  // The bug the per-pool condition exists for: the control hides when the edit
  // is withdrawn, but the flag it left behind stayed on.
  it('ignores a request for a pool no longer offered', async () => {
    const save = jest.fn();
    await run({
      pending: { primary: wanted, backup: wanted },
      offered: { primary: false, backup: true },
      save,
    });

    expect(save.mock.calls.map(([input]) => input.url)).toEqual(['stratum+tcp://b:2']);
  });

  // Solo mining rewrites the pool to the local ckpool; keeping 127.0.0.1 in the
  // list would hand a later save a pool that points a normal miner at nothing.
  it('keeps nothing while solo mining owns the pool', async () => {
    const save = jest.fn();
    await run({
      pending: { primary: wanted, backup: wanted },
      settings: { ...settings, nodeEnableSoloMining: true },
      save,
    });

    expect(save).not.toHaveBeenCalled();
  });

  // The interaction that matters. The restarts happen after this returns, and
  // they are what makes the saved settings take effect — so nothing in here may
  // throw, whatever the device answers.
  it('does not throw when the device refuses the save', async () => {
    const save = jest.fn().mockResolvedValue({ ok: false, message: 'disk is full' });
    const feedback = await run({ pending: { primary: wanted, backup: idle }, save });

    expect(feedback).toEqual([{ message: 'disk is full', type: 'error' }]);
  });

  it('does not throw when the call itself blows up', async () => {
    const save = jest.fn().mockRejectedValue(new Error('network is down'));
    const feedback = await run({ pending: { primary: wanted, backup: idle }, save });

    expect(feedback).toHaveLength(1);
    expect(feedback[0]).toMatchObject({ type: 'error' });
  });

  it('reports a failure after a success, never buried under it', async () => {
    const save = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, profile: { name: 'kept' } })
      .mockResolvedValueOnce({ ok: false, message: 'nope' });

    const feedback = await run({ pending: { primary: wanted, backup: wanted }, save });

    expect(feedback.map((f) => f.type)).toEqual(['success', 'error']);
  });

  it('falls back to the suggested name when none was typed', async () => {
    const save = jest.fn().mockResolvedValue({ ok: true, profile: { name: 'kept' } });
    await run({ pending: { primary: { enabled: true, name: '  ' }, backup: idle }, save });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'stratum+tcp://a:1' })
    );
  });

  it('does nothing at all when nothing was asked for', async () => {
    const save = jest.fn();
    const feedback = await run({ save });

    expect(save).not.toHaveBeenCalled();
    expect(feedback).toEqual([]);
  });
});
