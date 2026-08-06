import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_POOL_PROFILES_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_POOL_PROFILES {
    PoolProfiles {
      list {
        result {
          profiles {
            id
            name
            url
            username
            password
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SAVE_POOL_PROFILE_MUTATION = gql`
  ${ERROR_FRAGMENT}
  mutation SAVE_POOL_PROFILE($input: PoolProfileSaveInput!) {
    PoolProfiles {
      save(input: $input) {
        result {
          profile {
            id
            name
            url
            username
            password
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;
