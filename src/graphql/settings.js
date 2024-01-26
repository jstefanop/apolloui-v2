import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_SETTINGS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_SETTINGS {
    Settings {
      read {
        result {
          settings {
            agree
            minerMode
            voltage
            frequency
            fan_low
            fan_high
            apiAllow
            customApproval
            connectedWifi
            leftSidebarVisibility
            leftSidebarExtended
            rightSidebarVisibility
            temperatureUnit
            nodeRpcPassword
            nodeEnableTor
            nodeUserConf
            nodeEnableSoloMining
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;

export const SET_SETTINGS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SET_SETTINGS($input: SettingsUpdateInput!) {
    Settings {
      update(input: $input) {
        result {
          settings {
            agree
            minerMode
            voltage
            frequency
            fan_low
            fan_high
            apiAllow
            customApproval
            connectedWifi
            leftSidebarVisibility
            leftSidebarExtended
            rightSidebarVisibility
            temperatureUnit
            nodeRpcPassword
            nodeEnableTor
            nodeUserConf
            nodeEnableSoloMining
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
  Settings: {
    read: {
      result: {
        settings: {
          agree: null,
          minerMode: null,
          voltage: null,
          frequency: null,
          fan_low: null,
          fan_high: null,
          apiAllow: null,
          customApproval: null,
          connectedWifi: null,
          leftSidebarVisibility: null,
          leftSidebarExtended: null,
          rightSidebarVisibility: null,
          temperatureUnit: null,
          nodeRpcPassword: null,
          nodeEnableTor: null,
          nodeUserConf: null,
          nodeEnableSoloMining: null,
        },
      },
    },
  },
};
