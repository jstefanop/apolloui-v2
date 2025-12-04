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

export const GET_SOLO_ANALYTICS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_SOLO_ANALYTICS ($input: TimeSeriesInput!) {
    TimeSeries {
      stats (input: $input) {
        result {
          data {
            date
            users
            workers
            idle
            disconnected
            hashrate15m
            accepted
            rejected
            bestshare
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

export const initialSoloState = {
  TimeSeries: {
    stats: {
      result: {
        data: [],
      },
      error: null,
    },
  },
};