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
