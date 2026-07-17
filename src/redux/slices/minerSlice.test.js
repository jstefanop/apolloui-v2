import reducer, { updateMinerStats } from './minerSlice';

// Minimal miner payload with one board reporting a cumulative share counter.
const payload = (uuid, sent) => ({
  data: { Miner: { stats: { result: { stats: [{ uuid, pool: { intervals: { int_0: { sharesSent: sent } } } }] } } } },
  loading: false,
  error: null,
});

describe('minerSlice — reconstructed last-share time', () => {
  it('stamps a board the first time it is seen', () => {
    const s = reducer(undefined, updateMinerStats(payload('a', 100)));
    expect(s.lastShare.a).toMatchObject({ sent: 100 });
    expect(typeof s.lastShare.a.at).toBe('number');
  });

  it('keeps the timestamp while the share count is unchanged (no new share)', () => {
    let s = reducer(undefined, updateMinerStats(payload('a', 100)));
    const first = s.lastShare.a.at;

    const spy = jest.spyOn(Date, 'now').mockReturnValue(first + 10000);
    s = reducer(s, updateMinerStats(payload('a', 100)));
    spy.mockRestore();

    expect(s.lastShare.a.at).toBe(first); // not advanced — the pool got nothing new
  });

  it('advances the timestamp when the share count moves', () => {
    let s = reducer(undefined, updateMinerStats(payload('a', 100)));
    const first = s.lastShare.a.at;

    const spy = jest.spyOn(Date, 'now').mockReturnValue(first + 5000);
    s = reducer(s, updateMinerStats(payload('a', 101)));
    spy.mockRestore();

    expect(s.lastShare.a).toMatchObject({ sent: 101, at: first + 5000 });
  });

  it('tracks boards independently by uuid', () => {
    let s = reducer(undefined, updateMinerStats(payload('a', 100)));
    const aAt = s.lastShare.a.at;

    // A different board appears; 'a' is absent from this push but must be retained.
    const spy = jest.spyOn(Date, 'now').mockReturnValue(aAt + 3000);
    s = reducer(s, updateMinerStats(payload('b', 5)));
    spy.mockRestore();

    expect(s.lastShare.a.at).toBe(aAt); // untouched
    expect(s.lastShare.b).toMatchObject({ sent: 5 });
  });
});
