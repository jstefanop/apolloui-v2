import fs from 'fs';
import handler from '../pages/api/config';

// The route reads files rather than process.env on purpose: Next.js inlines
// NEXT_PUBLIC_* at build time even inside API routes, so anything read from the
// environment here would be frozen into the bundle. These tests therefore
// control the filesystem, which is what the route actually consults.

jest.mock('fs');

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

/** files: { '/etc/armbian-release': '...', '.env': '...' } — anything else ENOENT */
const givenFiles = (files) => {
  fs.readFileSync.mockImplementation((file) => {
    for (const [name, contents] of Object.entries(files)) {
      if (String(file).endsWith(name)) return contents;
    }
    const error = new Error('ENOENT');
    error.code = 'ENOENT';
    throw error;
  });
};

const call = () => {
  const res = mockRes();
  handler({ method: 'GET' }, res);
  return res.json.mock.calls[0][0];
};

describe('/api/config runtime device config', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    ENV_KEYS.forEach((key) => delete process.env[key]);
    givenFiles({});
  });

  it('rejects non-GET methods with 405', () => {
    const res = mockRes();
    handler({ method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('falls back to a plain miner when it can read nothing at all', () => {
    expect(call()).toEqual({ deviceType: 'miner', chassis: null, usbMiners: false });
  });

  // The board name is the hardware talking, and the same source set_UI_mode.sh
  // reads — so the two cannot drift apart.
  it('derives the chassis from BOARD_NAME', () => {
    givenFiles({ 'armbian-release': 'BOARD_NAME="Apollo 3"\nVERSION=26.5\n' });
    expect(call().chassis).toBe('apollo-iii');

    givenFiles({ 'armbian-release': 'BOARD_NAME="Solo Node"\n' });
    expect(call().chassis).toBe('solo-node');
  });

  it('reports no chassis for a board that is neither, which identifies an Apollo I/II', () => {
    givenFiles({ 'armbian-release': 'BOARD_NAME="Rock 5B Plus"\n' });
    expect(call().chassis).toBeNull();
  });

  it('prefers the board over a stale value left in the UI env file', () => {
    // Exactly what an apt upgrade produces: the board says one thing, the file
    // written at an earlier boot still says another.
    givenFiles({
      'armbian-release': 'BOARD_NAME="Solo Node"\n',
      '.env': 'NEXT_PUBLIC_CHASSIS="apollo-iii"\n',
    });
    expect(call().chassis).toBe('solo-node');
  });

  it('uses the UI env file when there is no board name to go on', () => {
    givenFiles({ '.env': 'NEXT_PUBLIC_CHASSIS="apollo-iii"\n' });
    expect(call().chassis).toBe('apollo-iii');
  });

  it('reads usbMiners by presence, not by a specific value', () => {
    // set_UI_mode.sh writes "true", but earlier builds wrote a board name.
    givenFiles({ '.env': 'NEXT_PUBLIC_USB_MINERS="true"\n' });
    expect(call().usbMiners).toBe(true);

    givenFiles({ '.env': 'NEXT_PUBLIC_USB_MINERS=apollo-ii\n' });
    expect(call().usbMiners).toBe(true);

    givenFiles({ '.env': 'NEXT_PUBLIC_USB_MINERS=""\n' });
    expect(call().usbMiners).toBe(false);
  });

  it('still honours the environment in development, where there is no device', () => {
    process.env.CHASSIS = 'apollo-iii';
    process.env.DEVICE_TYPE = 'solo-node';
    const result = call();
    expect(result.chassis).toBe('apollo-iii');
    expect(result.deviceType).toBe('solo-node');
  });
});
