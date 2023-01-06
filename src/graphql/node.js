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
