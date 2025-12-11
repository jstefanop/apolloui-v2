import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './error';

export const MINER_STATS_FRAGMENT = gql`
  ${ERROR_FRAGMENT}
  fragment MinerStatsFragment on MinerStatsOutput {
    result {
      stats {
        uuid
        version
        date
        lastsharetime @client
        status @client
        statVersion
        comport
        versions {
          miner
          minerDate
          minerDebug
          mspVer
        }
        master {
          upTime
          diff
          boards
          errorSpi
          osc
          hwAddr
          boardsI
          boardsW
          wattPerGHs
          intervals {
            int_0 {
              name
              interval
              bySol
              byDiff
              byPool
              byJobs
              solutions
              errors
              errorRate
              chipSpeed
              chipRestarts
            }
            int_30 {
              name
              interval
              bySol
              byDiff
              byPool
              byJobs
              solutions
              errors
              errorRate
              chipSpeed
              chipRestarts
            }
            int_300 {
              name
              interval
              bySol
              byDiff
              byPool
              byJobs
              solutions
              errors
              errorRate
              chipSpeed
              chipRestarts
            }
            int_900 {
              name
              interval
              bySol
              byDiff
              byPool
              byJobs
              solutions
              errors
              errorRate
              chipSpeed
              chipRestarts
            }
            int_3600 {
              name
              interval
              bySol
              byDiff
              byPool
              byJobs
              solutions
              errors
              errorRate
              chipSpeed
              chipRestarts
            }
          }
        }
        pool {
          host
          port
          userName
          diff
          status @client
          intervals {
            int_0 {
              name
              interval
              jobs
              cleanFlags
              sharesSent
              sharesAccepted
              sharesRejected
              solutionsAccepted
              minRespTime
              avgRespTime
              maxRespTime
              shareLoss
              poolTotal
              inService
              subscribeError
              diffChanges
              reconnections
              reconnectionsOnErrors
              defaultJobShares
              staleJobShares
              duplicateShares
              lowDifficultyShares
              pwcSharesSent
              pwcSharesDropped
              bigDiffShares
              belowTargetShare
              pwcRestart
              statOverflow
            }
          }
        }
        fans {
          int_0 {
            rpm
          }
        }
        temperature {
          count
          min
          avr
          max
        }
        slots {
          int_0 {
            revision
            spiNum
            spiLen
            pwrNum
            pwrLen
            btcNum
            specVoltage
            chips
            pwrOn
            pwrOnTarget
            revAdc
            temperature
            temperature1
            ocp
            heaterErr
            heaterErrNum
            inOHOsc
            ohOscNum
            ohOscTime
            overheats
            overheatsTime
            lowCurrRst
            currents
            brokenPwc
            solutions
            errors
            ghs
            errorRate
            chipRestarts
            wattPerGHs
            tmpAlert {
              alertLo
              alertHi
              numWrite
            }
            osc
            oscStopChip
          }
        }
        slaves {
          id
          uid
          ver
          rx
          err
          time
          ping
        }

      }
    }
    error {
      ...ErrorFragment
    }
  }
`;
