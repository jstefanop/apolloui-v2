import handler from '../pages/api/config';

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('/api/config runtime device type', () => {
  beforeEach(() => {
    delete process.env.DEVICE_TYPE;
    delete process.env.NEXT_PUBLIC_DEVICE_TYPE;
  });

  it('returns deviceType from DEVICE_TYPE env', () => {
    process.env.DEVICE_TYPE = 'solo-node';
    const res = mockRes();
    handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ deviceType: 'solo-node' });
  });

  it('falls back to "miner" when no env is set', () => {
    const res = mockRes();
    handler({ method: 'GET' }, res);
    expect(res.json).toHaveBeenCalledWith({ deviceType: 'miner' });
  });

  it('rejects non-GET methods with 405', () => {
    const res = mockRes();
    handler({ method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
