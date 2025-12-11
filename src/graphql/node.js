import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const NODE_STATS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_STATS {
    Node {
      stats {
        result {
          stats {
            timestamp
            blockchainInfo {
              blocks
              blockTime
              headers
              sizeOnDisk
              verificationprogress
            }
            connectionCount
            miningInfo {
              difficulty
              networkhashps
            }
            peerInfo {
              addr
              subver
            }
            networkInfo {
              version
              subversion
              localaddresses {
                address
                port
                score
              }
              connections_in
              connections_out
            }
            error {
              code
              message
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

export const NODE_STOP_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_STOP {
    Node {
      stop {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const NODE_START_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_START {
    Node {
      start {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const NODE_CONF_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_CONF {
    Node {
      conf {
        result {
          bitcoinConf
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const NODE_FORMAT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_FORMAT {
    Node {
      format {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const NODE_FORMAT_PROGRESS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_FORMAT_PROGRESS {
    Node {
      formatProgress {
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

export const initialState = {
  Node: {
    stats: {
      result: {
        stats: {
          timestamp: null,
          blockchainInfo: {
            blocks: null,
            blockTime: null,
            headers: null,
            sizeOnDisk: null,
            verificationprogress: null,
          },
          connectionCount: null,
          miningInfo: {
            difficulty: null,
            networkhashps: null,
          },
          peerInfo: [],
          networkInfo: {
            version: null,
            subversion: null,
            localaddresses: [],
            connections_in: null,
            connections_out: null,
          },
          error: null,
        },
      },
    },
  },
};
