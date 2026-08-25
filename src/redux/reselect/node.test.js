import { nodeSelector } from './node';

// The fallback that keeps the last good stats on screen while bitcoind is busy,
// and the bound that stops it from outliving the node. Without the bound, an
// Apollo with no SSD showed the Overview the block height from before the
// shutdown — no error, no sign it was frozen — until the page was reloaded.

const lastKnown = {
  Node: {
    stats: {
      result: { stats: { timestamp: 1, blockchainInfo: { blocks: 900000 } } },
    },
  },
};

const state = ({ error = null, data = null, nodeService = 'online' } = {}) => ({
  node: { data, error, received: true, loading: false, lastKnownData: lastKnown },
  services: {
    data: {
      Services: {
        stats: {
          result: {
            data: [
              { serviceName: 'node', status: nodeService },
              { serviceName: 'miner', status: 'online' },
            ],
          },
          error: null,
        },
      },
    },
  },
});

const refused = { message: 'connect ECONNREFUSED 127.0.0.1:8332' };

describe('nodeSelector — the stale fallback', () => {
  it('keeps the last stats through a refused connection while the unit is up', () => {
    // bitcoind refuses RPC for the first minute after it starts; blanking the
    // dashboard every restart is what this fallback exists to prevent.
    const out = nodeSelector(state({ error: refused }));
    expect(out.error).toEqual([]);
    expect(out.data).toMatchObject({ blocksCount: 900000, stale: true });
  });

  it('stops pretending once systemd says the node is down', () => {
    // No drive: the unit is skipped, bitcoind will never answer, and the error
    // is the same ECONNREFUSED forever.
    const out = nodeSelector(state({ error: refused, nodeService: 'offline' }));
    expect(out.data).toBeNull();
    expect(out.error).toHaveLength(1);
  });

  it('still falls back before the services status has arrived', () => {
    // A reconnecting page gets the node push before the services one; an
    // unknown status must not be read as "down".
    const s = state({ error: refused });
    s.services.data = null;
    expect(nodeSelector(s).data).toMatchObject({ stale: true });
  });

  it('surfaces an error that is not transient whatever the unit says', () => {
    const out = nodeSelector(state({ error: { message: 'method not found' } }));
    expect(out.data).toBeNull();
    expect(out.error).toHaveLength(1);
  });

  it('passes live stats through untouched', () => {
    const out = nodeSelector(
      state({ data: { Node: { stats: { result: { stats: { timestamp: 2, blockchainInfo: { blocks: 900001 } } } } } } })
    );
    expect(out.error).toEqual([]);
    expect(out.data).toMatchObject({ blocksCount: 900001 });
    expect(out.data.stale).toBeUndefined();
  });

  it('does not keep stats it never had', () => {
    const s = state({ error: refused });
    s.node.lastKnownData = null;
    expect(nodeSelector(s).data).toBeNull();
  });
});
