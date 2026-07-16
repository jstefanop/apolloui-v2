import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

const MQTT_FIELDS = `
  enabled
  host
  port
  username
  tls
  status { connected error }
  output { enabled control deviceId }
  inputs { name topic jsonPath unit }
`;

// System-level MQTT config: broker + output + input mappings. Lives in Settings →
// MQTT (broker + output) and Automation → Setup (inputs).
export const GET_MQTT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_MQTT {
    Mqtt {
      config {
        result { ${MQTT_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const SET_MQTT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SET_MQTT($input: MqttConfigInput!) {
    Mqtt {
      updateConfig(input: $input) {
        result { ${MQTT_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const TEST_MQTT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query TEST_MQTT($input: MqttConfigInput!) {
    Mqtt {
      testConnection(input: $input) {
        result { ok message }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const DISCOVER_MQTT_QUERY = gql`
  ${ERROR_FRAGMENT}
  query DISCOVER_MQTT($input: MqttConfigInput!, $prefix: String, $seconds: Int) {
    Mqtt {
      discoverTopics(input: $input, prefix: $prefix, seconds: $seconds) {
        result {
          ok
          error
          topics { topic sample jsonPaths name unit jsonPath value }
        }
        error { ...ErrorFragment }
      }
    }
  }
`;
