import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const NODE_STORAGE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query NODE_STORAGE {
    Node {
      storage {
        result {
          state
          available
          size
          disk
          mountpoint
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;
