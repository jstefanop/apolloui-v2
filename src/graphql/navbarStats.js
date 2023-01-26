import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const NAVBAR_STATS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NAVBAR_STATS {
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
            status @client
            statVersion
            versions {
              miner
              minerDate
              minerDebug
              mspVer
            }
            temperature {
              count
              min
              avr
              max
            }
            slots {
              int_0 {
                temperature
                temperature1
                ghs
              }
            }
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
    Node {
      stats {
        result {
          stats {
            timestamp
            networkInfo {
              version
              subversion
            }
            error {
              code
              message
            }
          }
        }
      }
    }
  }
`;

export const initialState = {
  Miner: {
    stats: {
      result: {
        stats: [
          {
            status: false,
            statVersion: null,
            versions: {
              miner: null,
              minerDate: null,
              minerDebug: null,
              mspVer: null,
              __typename: 'MinerStatsVersion',
            },
            temperature: {
              count: null,
              min: null,
              avr: null,
              max: null,
              __typename: 'MinerStatsTemperature',
            },
            __typename: 'MinerStats',
          },
        ],
        __typename: 'MinerStatsResult',
      },
      error: null,
      __typename: 'MinerStatsOutput',
    },
    online: {
      result: {
        online: {
          timestamp: null,
          status: false,
          __typename: 'MinerOnline',
        },
        __typename: 'MinerOnlineResult',
      },
      error: null,
      __typename: 'MinerOnlineOutput',
    },
    __typename: 'MinerActions',
  },
  Node: {
    stats: {
      result: {
        stats: {
          timestamp: null,
          networkInfo: null,
          error: {
            code: null,
            message: null,
            __typename: 'LoadingError',
          },
          __typename: 'NodeStats',
        },
        __typename: 'NodeStatsResult',
      },
      __typename: 'NodeStatsOutput',
    },
    __typename: 'NodeActions',
  },
};
