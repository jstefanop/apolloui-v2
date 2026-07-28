import { createContext, useContext, useState, useEffect, useMemo } from 'react';

/**
 * What hardware this box is, as far as the UI needs to care.
 *
 * The one distinction that drives the settings screens is which miner the box
 * runs internally, because the two generations take different tuning options:
 * Apollo III is a target hashrate and a fan target temperature, Apollo I/II are
 * board voltage, oscillator and a fan temperature range. Hence `minerFamily`
 * rather than a boolean — every Apollo I/II has an internal miner too, so
 * "has an internal miner" does not separate them.
 *
 *   minerFamily   'apollo-iii' | 'legacy' | null   (null: Solo Node, no internal board)
 *   hasUsbMiners  external USB boards can be attached and were detected
 *   isHybrid      an Apollo III alongside USB boards, where a III-only preset
 *                 would not apply to everything that is mining
 */
const DeviceConfigContext = createContext(undefined);

// Derived from what backend/utils/set_UI_mode.sh actually writes at boot.
function deriveConfig({ chassis, usbMiners }) {
  if (chassis === 'apollo-iii') {
    // miner_start.sh starts the v3 binary alone: no external boards on this one.
    return { minerFamily: 'apollo-iii', hasUsbMiners: !!usbMiners };
  }
  if (chassis === 'solo-node') {
    // A node, optionally with USB miners plugged into it.
    return { minerFamily: null, hasUsbMiners: !!usbMiners };
  }
  // No chassis variable: the detection script is not run for Apollo I/II at all
  // (see rc.local), and those always have an internal board plus USB ports.
  return { minerFamily: 'legacy', hasUsbMiners: true };
}

export const DeviceConfigProvider = ({ children }) => {
  // Build-time values as the first paint, so the layout does not flash; the API
  // below then replaces them with what the device actually reports.
  const [config, setConfig] = useState(() => ({
    deviceType: process.env.NEXT_PUBLIC_DEVICE_TYPE || 'miner',
    chassis: process.env.NEXT_PUBLIC_CHASSIS || null,
    usbMiners: !!process.env.NEXT_PUBLIC_USB_MINERS,
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip API call during SSR (build time)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfig({
            deviceType: data.deviceType || 'miner',
            chassis: data.chassis || null,
            usbMiners: !!data.usbMiners,
          });
        } else {
          // Keep the build-time values rather than guessing.
          console.warn('Failed to fetch device config from API, using fallback');
        }
      } catch (error) {
        console.error('Failed to fetch device config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const value = useMemo(() => {
    const { minerFamily, hasUsbMiners } = deriveConfig(config);
    return {
      deviceType: config.deviceType,
      chassis: config.chassis,
      minerFamily,
      hasUsbMiners,
      isHybrid: minerFamily === 'apollo-iii' && hasUsbMiners,
      loading,
    };
  }, [config, loading]);

  return (
    <DeviceConfigContext.Provider value={value}>
      {children}
    </DeviceConfigContext.Provider>
  );
};

export const useDeviceType = () => {
  const context = useContext(DeviceConfigContext);
  if (context === undefined) {
    throw new Error('useDeviceType must be used within a DeviceConfigProvider');
  }
  return context.deviceType;
};

export const useDeviceConfig = () => {
  const context = useContext(DeviceConfigContext);
  if (context === undefined) {
    throw new Error('useDeviceConfig must be used within a DeviceConfigProvider');
  }
  return context;
};
