import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

// Reads are queries, changes are mutations. Joining a network carries a
// passphrase and is not idempotent; Apollo re-executes queries on re-render,
// which is how the old panel could re-send one.

export const WIFI_INTERFACES_QUERY = gql`
  ${ERROR_FRAGMENT}
  query WIFI_INTERFACES {
    Mcu {
      wifiInterfaces {
        result {
          preferred
          interfaces {
            device
            kind
            state
            connected
            connection
            carriesDefaultRoute
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_STATUS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query WIFI_STATUS($ifname: String) {
    Mcu {
      wifiStatus(ifname: $ifname) {
        result {
          connected
          ssid
          interface
          kind
          carriesDefaultRoute
          ipAddress
          signal
          signalDbm
          band
          channel
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_NETWORKS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query WIFI_NETWORKS($ifname: String!) {
    Mcu {
      wifiNetworks(ifname: $ifname) {
        result {
          networks {
            ssid
            hidden
            signal
            security
            open
            active
            bands
            channel
            # The only stable identity a hidden network has — it announces no
            # name, and the list is keyed by one.
            bssid
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_SAVED_QUERY = gql`
  ${ERROR_FRAGMENT}
  query WIFI_SAVED {
    Mcu {
      wifiSaved {
        result {
          networks {
            # The name is the PROFILE's id, not the network: netplan — what Solo
            # Node and Apollo III ship — calls the profile for the network Home
            # "netplan-wlan0-Home". Match and display on ssid.
            name
            ssid
            uuid
            device
            active
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_CONNECT_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation WIFI_CONNECT($input: McuWifiConnectInput!) {
    Mcu {
      wifiConnect(input: $input) {
        result {
          connected
          ssid
          ipAddress
          interface
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_DISCONNECT_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation WIFI_DISCONNECT($ifname: String!) {
    Mcu {
      wifiDisconnect(ifname: $ifname) {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const WIFI_FORGET_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation WIFI_FORGET($uuid: String!) {
    Mcu {
      wifiForget(uuid: $uuid) {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;
