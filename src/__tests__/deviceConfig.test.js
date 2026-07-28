import { render, screen, waitFor } from '@testing-library/react';
import { DeviceConfigProvider, useDeviceConfig } from '../contexts/DeviceConfigContext';

// What the settings screens branch on. Getting this wrong does not throw — it
// silently hides controls (an Apollo III without its own presets) or offers ones
// the hardware cannot honour, so the mapping is asserted per device.

const Probe = () => {
  const { minerFamily, hasUsbMiners, isHybrid, loading } = useDeviceConfig();
  if (loading) return <span>loading</span>;
  return (
    <span data-testid="probe">
      {`${minerFamily}|${hasUsbMiners}|${isHybrid}`}
    </span>
  );
};

const renderWith = async (apiPayload) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => apiPayload,
  });
  render(
    <DeviceConfigProvider>
      <Probe />
    </DeviceConfigProvider>
  );
  await waitFor(() => expect(screen.getByTestId('probe')).toBeInTheDocument());
  return screen.getByTestId('probe').textContent;
};

describe('DeviceConfigProvider — hardware mapping', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Apollo III: its own miner family, no USB boards', async () => {
    // miner_start.sh starts the v3 binary alone on this chassis.
    expect(await renderWith({ deviceType: 'miner', chassis: 'apollo-iii', usbMiners: false }))
      .toBe('apollo-iii|false|false');
  });

  it('Apollo I/II: legacy family, and USB boards can be attached', async () => {
    // rc.local does not run the detection script for these, so no chassis is
    // written — the absence is what identifies them. They do have an internal
    // board (on /dev/ttyS1), it simply takes the legacy options.
    expect(await renderWith({ deviceType: 'miner', chassis: null, usbMiners: false }))
      .toBe('legacy|true|false');
  });

  it('Solo Node: no internal miner at all', async () => {
    expect(await renderWith({ deviceType: 'solo-node', chassis: 'solo-node', usbMiners: false }))
      .toBe('null|false|false');
  });

  it('Solo Node with a USB miner plugged in', async () => {
    expect(await renderWith({ deviceType: 'solo-node', chassis: 'solo-node', usbMiners: true }))
      .toBe('null|true|false');
  });

  it('only flags hybrid when a III-only preset would leave USB boards behind', async () => {
    expect(await renderWith({ deviceType: 'miner', chassis: 'apollo-iii', usbMiners: true }))
      .toBe('apollo-iii|true|true');
  });

  it('keeps the build-time values when the API call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    render(
      <DeviceConfigProvider>
        <Probe />
      </DeviceConfigProvider>
    );
    // Falls back rather than blanking the UI: without a chassis that is a legacy box.
    await waitFor(() => expect(screen.getByTestId('probe')).toBeInTheDocument());
    expect(screen.getByTestId('probe').textContent).toBe('legacy|true|false');
  });
});
