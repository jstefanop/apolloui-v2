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

// Mutations, not queries: Apollo re-executes queries on a re-render, and a
// phantom re-fire reboots the device, powers it off, or launches a second
// concurrent update (same hazard the node format move fixed).
export const MCU_SHUTDOWN_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation MCU_SHUTDOWN {
    Mcu {
      shutdown {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_REBOOT_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation MCU_REBOOT {
    Mcu {
      reboot {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MCU_UPDATE_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation MCU_UPDATE {
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

