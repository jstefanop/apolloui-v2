import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './error';

export const MINER_ONLINE_FRAGMENT = gql`
  ${ERROR_FRAGMENT}
  fragment MinerOnlineFragment on MinerOnlineOutput {
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
`;
