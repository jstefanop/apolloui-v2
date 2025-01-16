import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const SERVICES_STATUS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SERVICES_STATUS {
    Services {
      stats {
        result {
          data {
            id
            serviceName
            status
            requestedStatus
            lastChecked
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const initialState = {
  Services: {
    stats: {
      result: {
        data: {
          id: null,
          serviceName: null,
          status: null,
          requestedStatus: null,
          lastChecked: null,
        },
      },
      error: {
        code: null,
        message: null,
      },
    },
  },
};
