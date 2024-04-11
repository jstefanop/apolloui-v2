import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_ANALYTICS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_ANALYTICS {
    TimeSeries {
      stats($input: TimeSeriesInput!) {
        result {
          data {
            date
            hashrate
            accepted
            poolHashrate
            accepted
            rejected
            sent
            errors
            watts
            temperature
            voltage
            chipSpeed
            fanRpm
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
  TimeSeries: {
    stats: {
      result: {
        data: {
          date: null,
          hashrate: null,
          accepted: null,
          poolHashrate: null,
          accepted: null,
          rejected: null,
          sent: null,
          errors: null,
          watts: null,
          temperature: null,
          voltage: null,
          chipSpeed: null,
          fanRpm: null,
        },
      },
      error: null,
    },
  },
};
