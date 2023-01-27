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

export const initialState = {
  Node: {
    stats: {
      result: {
        stats: {
          timestamp: null,
          networkInfo: null,
          error: {
            code: null,
            message: null,
          },
        },
      },
    },
  },
};
