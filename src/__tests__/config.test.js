import handler from '../pages/api/config';

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const ENV_KEYS = [
  'DEVICE_TYPE',
  'NEXT_PUBLIC_DEVICE_TYPE',
  'CHASSIS',
  'NEXT_PUBLIC_CHASSIS',
  'USB_MINERS',
  'NEXT_PUBLIC_USB_MINERS',
];

const call = () => {
  const res = mockRes();
  handler({ method: 'GET' }, res);
  return res.json.mock.calls[0][0];
};

describe('/api/config runtime device config', () => {
  beforeEach(() => {
    ENV_KEYS.forEach((key) => delete process.env[key]);
  });

  it('returns deviceType from DEVICE_TYPE env', () => {
    process.env.DEVICE_TYPE = 'solo-node';
    const res = mockRes();
    handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ deviceType: 'solo-node' })
    );
  });

  it('falls back to "miner" when no env is set', () => {
    expect(call()).toEqual({ deviceType: 'miner', chassis: null, usbMiners: false });
  });

  it('rejects non-GET methods with 405', () => {
    const res = mockRes();
    handler({ method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  // The chassis is written at boot by backend/utils/set_UI_mode.sh. It must be read
  // at request time, not inlined at build time, or the UI would have to be rebuilt
  // on the device whenever the hardware it reports changes.
  it('reports the chassis the detection script wrote', () => {
    process.env.CHASSIS = 'apollo-iii';
    expect(call().chassis).toBe('apollo-iii');
  });

  it('treats a missing chassis as such, since that identifies an Apollo I/II', () => {
    expect(call().chassis).toBeNull();
  });

  it('reads usbMiners by presence, not by a specific value', () => {
    // The script writes "true", but earlier builds wrote a board name.
    process.env.USB_MINERS = 'true';
    expect(call().usbMiners).toBe(true);

    process.env.USB_MINERS = 'apollo-ii';
    expect(call().usbMiners).toBe(true);

    process.env.USB_MINERS = '';
    expect(call().usbMiners).toBe(false);
  });

  it('prefers the runtime variables over the build-time ones', () => {
    process.env.NEXT_PUBLIC_CHASSIS = 'solo-node';
    process.env.CHASSIS = 'apollo-iii';
    expect(call().chassis).toBe('apollo-iii');
  });
});
