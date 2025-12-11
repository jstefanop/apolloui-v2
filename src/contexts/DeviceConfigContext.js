import { createContext, useContext, useState, useEffect } from 'react';

const DeviceConfigContext = createContext({
  deviceType: null,
  loading: true,
});

export const DeviceConfigProvider = ({ children }) => {
  // Initialize with build-time env var as fallback, will be updated from API
  const [deviceType, setDeviceType] = useState(
    process.env.NEXT_PUBLIC_DEVICE_TYPE || 'miner'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch device configuration from API
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setDeviceType(data.deviceType || 'miner');
        } else {
          // Fallback to build-time env var if API fails
          console.warn('Failed to fetch device config from API, using fallback');
        }
      } catch (error) {
        console.error('Failed to fetch device config:', error);
        // Keep the initial fallback value
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <DeviceConfigContext.Provider value={{ deviceType, loading }}>
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

