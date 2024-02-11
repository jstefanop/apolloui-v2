import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const MINER_STATS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MINER_STATS {
    Miner {
      online {
        result {
          online {
            timestamp
            status
          }
        }
        error {
          ...ErrorFragment
        }
      }
      stats {
        result {
          stats {
            uuid
            date
            lastsharetime @client
            status @client
            statVersion
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
            ckpool {
              pool {
                runtime
                lastupdate
                Users
                Workers
                Idle
                Disconnected
                hashrate1m
                hashrate5m
                hashrate15m
                hashrate1hr
                hashrate6hr
                hashrate1d
                hashrate7d
                diff
                accepted
                rejected
                bestshare
                SPS1m
                SPS5m
                SPS15m
                SPS1h
              }
              users {
                hashrate1m
                hashrate5m
                hashrate1hr
                hashrate1d
                hashrate7d
                lastshare
                workers
                shares
                bestshare
                bestever
                authorised
                worker {
                  workername
                  hashrate1m
                  hashrate5m
                  hashrate1hr
                  hashrate1d
                  hashrate7d
                  lastshare
                  shares
                  bestshare
                  bestever
                }
              }
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

export const MINER_STOP_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MINER_STOP {
    Miner {
      stop {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MINER_START_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MINER_START {
    Miner {
      start {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const MINER_RESTART_QUERY = gql`
  ${ERROR_FRAGMENT}
  query MINER_RESTART {
    Miner {
      restart {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const initialState = {
  Miner: {
    online: {
      result: {
        online: {
          timestamp: null,
          status: false,
        },
      },
    },
    stats: {
      result: {
        stats: [
          {
            uuid: null,
            date: null,
            statVersion: null,
            versions: {
              miner: null,
              minerDate: null,
              minerDebug: null,
              mspVer: null,
            },
            master: {
              upTime: null,
              diff: null,
              boards: null,
              errorSpi: null,
              osc: null,
              hwAddr: null,
              boardsI: null,
              boardsW: null,
              wattPerGHs: null,
              intervals: {
                int_0: {
                  name: null,
                  interval: null,
                  bySol: null,
                  byDiff: null,
                  byPool: null,
                  byJobs: null,
                  solutions: null,
                  errors: null,
                  errorRate: null,
                  chipSpeed: null,
                  chipRestarts: null,
                },
                int_30: {
                  name: null,
                  interval: null,
                  bySol: null,
                  byDiff: null,
                  byPool: null,
                  byJobs: null,
                  solutions: null,
                  errors: null,
                  errorRate: null,
                  chipSpeed: null,
                  chipRestarts: null,
                },
                int_300: {
                  name: null,
                  interval: null,
                  bySol: null,
                  byDiff: null,
                  byPool: null,
                  byJobs: null,
                  solutions: null,
                  errors: null,
                  errorRate: null,
                  chipSpeed: null,
                  chipRestarts: null,
                },
                int_900: {
                  name: null,
                  interval: null,
                  bySol: null,
                  byDiff: null,
                  byPool: null,
                  byJobs: null,
                  solutions: null,
                  errors: null,
                  errorRate: null,
                  chipSpeed: null,
                  chipRestarts: null,
                },
                int_3600: {
                  name: null,
                  interval: null,
                  bySol: null,
                  byDiff: null,
                  byPool: null,
                  byJobs: null,
                  solutions: null,
                  errors: null,
                  errorRate: null,
                  chipSpeed: null,
                  chipRestarts: null,
                },
              },
            },
            pool: {
              host: null,
              port: null,
              userName: null,
              diff: null,
              intervals: {
                int_0: {
                  name: null,
                  interval: null,
                  jobs: null,
                  cleanFlags: null,
                  sharesSent: null,
                  sharesAccepted: null,
                  sharesRejected: null,
                  solutionsAccepted: null,
                  minRespTime: null,
                  avgRespTime: null,
                  maxRespTime: null,
                  shareLoss: null,
                  poolTotal: null,
                  inService: null,
                  subscribeError: null,
                  diffChanges: null,
                  reconnections: null,
                  reconnectionsOnErrors: null,
                  defaultJobShares: null,
                  staleJobShares: null,
                  duplicateShares: null,
                  lowDifficultyShares: null,
                  pwcSharesSent: null,
                  pwcSharesDropped: null,
                  bigDiffShares: null,
                  belowTargetShare: null,
                  pwcRestart: null,
                  statOverflow: null,
                },
              },
            },
            fans: {
              int_0: {
                rpm: [],
              },
            },
            temperature: {
              count: null,
              min: null,
              avr: null,
              max: null,
            },
            slots: {
              int_0: {
                revision: null,
                spiNum: null,
                spiLen: null,
                pwrNum: null,
                pwrLen: null,
                btcNum: null,
                specVoltage: null,
                chips: null,
                pwrOn: null,
                pwrOnTarget: null,
                revAdc: null,
                temperature: null,
                temperature1: null,
                ocp: null,
                heaterErr: null,
                heaterErrNum: null,
                inOHOsc: null,
                ohOscNum: null,
                ohOscTime: null,
                overheats: null,
                overheatsTime: null,
                lowCurrRst: null,
                currents: [],
                brokenPwc: null,
                solutions: null,
                errors: null,
                ghs: null,
                errorRate: null,
                chipRestarts: null,
                wattPerGHs: null,
                tmpAlert: [
                  {
                    alertLo: null,
                    alertHi: null,
                    numWrite: null,
                  },
                  {
                    alertLo: null,
                    alertHi: null,
                    numWrite: null,
                  },
                ],
                osc: null,
                oscStopChip: null,
              },
            },
            slaves: [
              {
                id: null,
                uid: null,
                ver: null,
                rx: null,
                err: null,
                time: null,
                ping: null,
              },
            ],
            ckpool: {
              pool: {
                runtime: null,
                lastupdate: null,
                Users: null,
                Workers: null,
                Idle: null,
                Disconnected: null,
                hashrate1m: null,
                hashrate5m: null,
                hashrate15m: null,
                hashrate1hr: null,
                hashrate6hr: null,
                hashrate1d: null,
                hashrate7d: null,
                diff: null,
                accepted: null,
                rejected: null,
                bestshare: null,
                SPS1m: null,
                SPS5m: null,
                SPS15m: null,
                SPS1h: null,
              },
              users: {
                hashrate1m: null,
                hashrate5m: null,
                hashrate1hr: null,
                hashrate1d: null,
                hashrate7d: null,
                lastshare: null,
                workers: null,
                shares: null,
                bestshare: null,
                bestever: null,
                authorised: null,
                worker: [
                  {
                    workername: null,
                    hashrate1m: null,
                    hashrate5m: null,
                    hashrate1hr: null,
                    hashrate1d: null,
                    hashrate7d: null,
                    lastshare: null,
                    shares: null,
                    bestshare: null,
                    bestever: null,
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
};
