import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './error';

export const AUTH_LOGIN = gql`
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
