import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './error';

export const MCU_STATS_FRAGMENT = gql`
  ${ERROR_FRAGMENT}
  fragment McuStatsFragment on McuStatsOutput {
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
`;
