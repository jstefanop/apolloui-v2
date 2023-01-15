import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_POOLS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_POOLS {
    Pool {
      list {
        result {
          pools {
            id
            enabled
            donation
            url
            username
            password
            proxy
            index
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SET_POOLS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SET_POOLS ($input: PoolCreateInput!) {
    Pool {
      create (input: $input) {
        result {
          pool {
            id
            enabled
            donation
            url
            username
            password
            proxy
            index
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const UPDATE_POOLS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query UPDATE_POOLS ($input: PoolUpdateAllInput!) {
    Pool {
      updateAll(input: $input) {
        result {
          pools {
            id
            enabled
            donation
            url
            username
            password
            proxy
            index
          }
        }
      }
      error {
        ...ErrorFragment
      }
    }
  }
`;
