import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const AUTH_LOGIN_QUERY = gql`
  ${ERROR_FRAGMENT}
  query Auth ($input: AuthLoginInput!) {
    Auth {
      login (input: $input) {
        result {
          accessToken
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const AUTH_STATUS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query Auth {
    Auth {
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

export const SAVE_SETUP_QUERY = gql`
  ${ERROR_FRAGMENT}
  query Auth ($input: AuthSetupInput!) {
    Auth {
      setup (input: $input) {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const CHANGE_PASSWORD_QUERY = gql`
  ${ERROR_FRAGMENT}
  query Auth ($input: AuthChangePasswordInput!) {
    Auth {
      changePassword (input: $input) {
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;
