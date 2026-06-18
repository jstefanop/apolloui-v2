import { createContext, useContext, useState, useEffect } from 'react';

const parseUsbMinersEnv = (raw) => {
  if (!raw || raw === 'none') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
};

const deriveMode = (chassis, hasInternalMiner, hasUsbMiners) => {
  if (chassis === 'apollo-iii') return hasUsbMiners ? 'apollo-iii+usb' : 'apollo-iii';
  if (chassis === 'apollo-ii') return 'apollo-ii';
  return hasUsbMiners ? 'solo-node+miner' : 'solo-node';
};

const buildConfig = ({ chassis, internalMiner, usbMiners, deviceType }) => {
  const hasInternalMiner = internalMiner && internalMiner !== 'none';
  const hasUsbMiners = Array.isArray(usbMiners) && usbMiners.length > 0;
  const mode = deriveMode(chassis, hasInternalMiner, hasUsbMiners);
  return {
    deviceType: deviceType || (mode === 'solo-node' ? 'solo-node' : 'miner'),
    chassis,
    internalMiner,
    usbMiners,
    hasInternalMiner,
    hasUsbMiners,
    mode,
    isHybrid: hasInternalMiner && hasUsbMiners,
  };
};

const initialConfig = buildConfig({
  chassis: process.env.NEXT_PUBLIC_CHASSIS || 'solo-node',
  internalMiner: process.env.NEXT_PUBLIC_INTERNAL_MINER || 'none',
  usbMiners: parseUsbMinersEnv(process.env.NEXT_PUBLIC_USB_MINERS),
  deviceType: process.env.NEXT_PUBLIC_DEVICE_TYPE,
});

const DeviceConfigContext = createContext({
  ...initialConfig,
  loading: true,
});

export const DeviceConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(
            buildConfig({
              chassis: data.chassis || 'solo-node',
              internalMiner: data.internalMiner || 'none',
              usbMiners: data.usbMiners || [],
              deviceType: data.deviceType,
            })
          );
        } else {
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

  return (
    <DeviceConfigContext.Provider value={{ ...config, loading }}>
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
