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
  query MCU_CONNECT($input: McuWifiConnectInput!) {
    Mcu {
      wifiConnect(input: $input) {
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
  query MCU_DISCONNECT {
    Mcu {
      wifiDisconnect {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_SHUTDOWN_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_SHUTDOWN {
    Mcu {
      shutdown {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_REBOOT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_REBOOT {
    Mcu {
      reboot {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_UPDATE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_UPDATE {
    Mcu {
      update {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_UPDATE_PROGRESS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_UPDATE_PROGRESS {
    Mcu {
      updateProgress {
        result {
          value
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_VERSION_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MCU_VERSION {
    Mcu {
      version {
        result
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const initialState = {
  Mcu: {
    stats: {
      result: {
        stats: {
          timestamp: null,
          hostname: null,
          operatingSystem: null,
          uptime: null,
          loadAverage: null,
          architecture: null,
          temperature: null,
          minerTemperature: null,
          minerFanSpeed: null,
          activeWifi: null,
          bfgminerLog: null,
          network: [],
          memory: {
            total: null,
            available: null,
            used: null,
            cache: null,
          },
          cpu: {
            threads: null,
            usedPercent: null,
          },
          disks: [],
        },
      },
    },
  },
};
