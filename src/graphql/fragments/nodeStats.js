import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './error';

export const NODE_STATS_FRAGMENT = gql`
  ${ERROR_FRAGMENT}
  fragment NodeStatsFragment on NodeStatsOutput {
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
        error {
          code
          message
        }
        error {
          message
          code
        }
      }
    }
    error {
      ...ErrorFragment
    }
  }
`;
