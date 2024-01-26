import { gql } from '@apollo/client';

export const ERROR_FRAGMENT = gql`
  fragment ErrorFragment on Error {
    message
    type
    severity
    reasons {
      path
      message
      reason
    }
  }
`;
