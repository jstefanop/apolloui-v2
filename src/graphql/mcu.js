import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const MCU_STATS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_STATS {
    Mcu {
      stats {
        result {
          stats {
            timestamp
            hostname
            operatingSystem
            uptime
            loadAverage
            architecture
            temperature
            minerTemperature
            minerFanSpeed
            activeWifi
            bfgminerLog
            network {
              name
              address
              mac
            }
            memory {
              total
              available
              used
              cache
              total
            }
            cpu {
              threads
              usedPercent
            }
            disks {
              total
              used
              mountPoint
            }
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_WIFI_SCAN_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_WIFI_SCAN {
    Mcu {
      wifiScan {
        result {
          wifiScan {
            ssid
            mode
            channel
            rate
            signal
            security
            inuse
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_WIFI_CONNECT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_CONNECT_SCAN ($input: McuWifiConnectInput!) {
    Mcu {
      wifiConnect (input: $input) {
        result {
          address
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_WIFI_DISCONNECT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_DISCONNECT_SCAN {
    Mcu {
      wifiDisconnect {
        error {
          ...ErrorFragment
        }
      }
    }    
  }
`;
