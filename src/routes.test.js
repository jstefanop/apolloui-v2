import { getRoutes } from './routes';

const paths = (deviceType) => getRoutes(deviceType).map((r) => r.path);

describe('getRoutes — device-type menu', () => {
  it('miner device shows the Miner menu', () => {
    expect(paths('miner')).toContain('/miner');
  });

  it('solo-node hides the Miner menu', () => {
    expect(paths('solo-node')).not.toContain('/miner');
  });

  it('common routes are always present for both device types', () => {
    for (const deviceType of ['miner', 'solo-node']) {
      expect(paths(deviceType)).toEqual(
        expect.arrayContaining(['/overview', '/solo-mining', '/node', '/system', '/settings'])
      );
    }
  });

  it('solo-node has exactly one fewer route (the miner one)', () => {
    expect(paths('solo-node').length).toBe(paths('miner').length - 1);
  });
});
