import { useQuery } from '@apollo/client';
import { WIFI_STATUS_QUERY } from '../graphql/wifi';

// Which network this device is on, and how strong the link is.
//
// The System page used to read this from the `activeWifi` string in the machine
// stats, which is every ACTIVE CONNECTION joined by commas — ethernet included —
// and took the first one. With both interfaces up that first entry is the wired
// connection, so the Wi-Fi card proudly displayed "Wired connection 1".
//
// Polled rather than pushed: the signal moves continuously, and the card is only
// worth refreshing while someone is looking at it.
export const useWifiStatus = ({ pollInterval = 15000 } = {}) => {
  const { data, loading } = useQuery(WIFI_STATUS_QUERY, {
    fetchPolicy: 'cache-and-network',
    pollInterval,
  });

  const status = data?.Mcu?.wifiStatus?.result || null;

  return {
    status,
    loading,
    // A device with no radio at all answers `connected: false` like a
    // disconnected one; `interface` is what tells them apart.
    hasRadio: !!status?.interface,
    connected: !!status?.connected,
  };
};

export default useWifiStatus;
