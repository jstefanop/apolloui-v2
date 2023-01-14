import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

export const GET_SETTINGS_QUERY = gql`
  ${ERROR_FRAGMENT}
  query Settings {
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
  query SET_SETTINGS ($input: SettingsUpdateInput!) {
    Settings {
      update (input: $input) {
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
          }
        }
        error {
          ...ErrorFragment
        }
      }
    }
  }
`;
