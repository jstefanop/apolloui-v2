import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_ANALYTICS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_ANALYTICS ($input: TimeSeriesInput!) {
    TimeSeries {
      stats (input: $input) {
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
        data: [],
      },
      error: null,
    },
  },
};
