import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const LOGS_READ_QUERY = gql`
  ${ERROR_FRAGMENT}
  query LOGS_READ($input: LogReadInput!) {
    Logs {
      read(input: $input) {
        result {
          content
          timestamp
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const initialState = {
  Logs: {
    read: {
      result: {
        content: null,
        timestamp: null,
      },
      error: null,
    },
  },
};