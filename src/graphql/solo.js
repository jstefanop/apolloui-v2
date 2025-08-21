import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const SOLO_STATUS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SOLO_STATUS {
    Solo {
      status {
        result {
          status
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SOLO_STATS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SOLO_STATS {
    Solo {
      stats {
        result {
          status
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
          blockFound
          timestamp
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SOLO_START_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SOLO_START {
    Solo {
      start {
        success
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SOLO_STOP_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SOLO_STOP {
    Solo {
      stop {
        success
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SOLO_RESTART_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SOLO_RESTART {
    Solo {
      restart {
        success
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const initialState = {
  Solo: {
    status: {
      result: {
        status: null,
      },
      error: null,
    },
    stats: {
      result: {
        status: null,
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
        users: [
          {
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
        ],
        blockFound: null,
        timestamp: null,
      },
      error: null,
    },
  },
};
