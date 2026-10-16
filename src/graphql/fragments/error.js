import { gql } from '@apollo/client';

export const ERROR_FRAGMENT = gql`
  fragment ErrorFragment on Error {
    message
    type
    path
    severity
    reasons {
      path
      message
      reason
    }
  }
`;
