import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';

const CONFIG_FIELDS = `
  enabled
  dryRun
  latitude
  longitude
  timezone
  fallbackAction
  minOnMinutes
  minOffMinutes
  minChangeMinutes
  maxCyclesPerHour
  defaultHysteresis
  overrideMinutes
  overrideUntil
  overrideReason
  tariff {
    currency
    flatPrice
    periods { days from to price band }
  }
`;

const RULE_FIELDS = `
  id
  name
  enabled
  priority
  isSafety
  match
  conditions { signal op value values hysteresis }
  action { type mode }
`;

const STATE_FIELDS = `
  enabled
  dryRun
  decision { target ruleId ruleName reason }
  guard { apply changeType blockedBy message }
  miner { running mode lastChangeAt cyclesLastHour overrideUntil }
  signals { id value stale pending error }
  event {
    id ruleId ruleName decision changeType applied dryRun blockedBy message createdAt
    signals { id value stale }
  }
`;

// Config only — used by Settings, which edits the device location (lat/long)
// without needing the rules, events and live state the automation page loads.
export const GET_AUTOMATION_CONFIG_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_AUTOMATION_CONFIG {
    Automation {
      config {
        result { ${CONFIG_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

// Live state only — for the compact automation summary on the overview page,
// which does not need the rules/events/signals the full page loads. Pairs with
// AUTOMATION_SUBSCRIPTION (same STATE_FIELDS shape) for live updates.
export const GET_AUTOMATION_STATE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_AUTOMATION_STATE {
    Automation {
      state {
        result { ${STATE_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

// Everything the page needs, in one round trip.
export const GET_AUTOMATION_QUERY = gql`
  ${ERROR_FRAGMENT}
  query GET_AUTOMATION($eventsLimit: Int) {
    Automation {
      config {
        result { ${CONFIG_FIELDS} }
        error { ...ErrorFragment }
      }
      rules {
        result { ${RULE_FIELDS} }
        error { ...ErrorFragment }
      }
      signals {
        result { id type widget options unit ops supportsHysteresis availableWhileOff }
        error { ...ErrorFragment }
      }
      state {
        result { ${STATE_FIELDS} }
        error { ...ErrorFragment }
      }
      events(limit: $eventsLimit) {
        result {
          id ruleId ruleName decision changeType applied dryRun blockedBy message createdAt
          signals { id value stale }
        }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const SET_AUTOMATION_CONFIG_QUERY = gql`
  ${ERROR_FRAGMENT}
  query SET_AUTOMATION_CONFIG($input: AutomationConfigInput!) {
    Automation {
      updateConfig(input: $input) {
        result { ${CONFIG_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const CREATE_AUTOMATION_RULE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query CREATE_AUTOMATION_RULE($input: AutomationRuleInput!) {
    Automation {
      createRule(input: $input) {
        result { ${RULE_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const UPDATE_AUTOMATION_RULE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query UPDATE_AUTOMATION_RULE($id: Int!, $input: AutomationRuleInput!) {
    Automation {
      updateRule(id: $id, input: $input) {
        result { ${RULE_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

export const DELETE_AUTOMATION_RULE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query DELETE_AUTOMATION_RULE($id: Int!) {
    Automation {
      deleteRule(id: $id) {
        error { ...ErrorFragment }
      }
    }
  }
`;

export const CLEAR_AUTOMATION_OVERRIDE_QUERY = gql`
  ${ERROR_FRAGMENT}
  query CLEAR_AUTOMATION_OVERRIDE {
    Automation {
      clearOverride {
        result { ${CONFIG_FIELDS} }
        error { ...ErrorFragment }
      }
    }
  }
`;

// Pushed by the scheduler on every tick — same shape as Automation.state.
export const AUTOMATION_SUBSCRIPTION = gql`
  subscription AUTOMATION_SUBSCRIPTION {
    automation {
      result { ${STATE_FIELDS} }
      error { message }
    }
  }
`;
