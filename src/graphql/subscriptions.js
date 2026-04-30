import { gql } from '@apollo/client';
import { ERROR_FRAGMENT } from './fragments/error';
import { MINER_STATS_FRAGMENT } from './fragments/minerStats';
import { MINER_ONLINE_FRAGMENT } from './fragments/minerOnline';
import { NODE_STATS_FRAGMENT } from './fragments/nodeStats';
import { MCU_STATS_FRAGMENT } from './fragments/mcuStats';

// Miner: combines stats + online in one push (matches the { Miner: { stats, online } } Redux shape)
export const MINER_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  ${MINER_STATS_FRAGMENT}
  ${MINER_ONLINE_FRAGMENT}
  subscription MINER_SUB {
    miner {
      stats {
        ...MinerStatsFragment
      }
      online {
        ...MinerOnlineFragment
      }
    }
  }
`;

// Node stats
export const NODE_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  ${NODE_STATS_FRAGMENT}
  subscription NODE_SUB {
    node {
      ...NodeStatsFragment
    }
  }
`;

// MCU stats
export const MCU_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  ${MCU_STATS_FRAGMENT}
  subscription MCU_SUB {
    mcu {
      ...McuStatsFragment
    }
  }
`;

// Solo mining stats
export const SOLO_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  subscription SOLO_SUB {
    solo {
      result {
        status
        pool {
          runtime
          lastupdate
          Users
          Workers
          Idle
          Disconnected
          hashrate1m
          hashrate5m
          hashrate15m
          hashrate1hr
          hashrate6hr
          hashrate1d
          hashrate7d
          diff
          accepted
          rejected
          bestshare
          SPS1m
          SPS5m
          SPS15m
          SPS1h
        }
        users {
          hashrate1m
          hashrate5m
          hashrate1hr
          hashrate1d
          hashrate7d
          lastshare
          workers
          shares
          bestshare
          bestever
          authorised
          worker {
            workername
            hashrate1m
            hashrate5m
            hashrate1hr
            hashrate1d
            hashrate7d
            lastshare
            shares
            bestshare
            bestever
          }
        }
        blockFound
        timestamp
      }
      error {
        ...ErrorFragment
      }
    }
  }
`;

// Services status
export const SERVICES_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  subscription SERVICES_SUB {
    services {
      result {
        data {
          id
          serviceName
          status
          requestedStatus
          requestedAt
          lastChecked
        }
      }
      error {
        ...ErrorFragment
      }
    }
  }
`;

// Settings — pushed whenever settings are updated via mutation
export const SETTINGS_SUBSCRIPTION = gql`
  ${ERROR_FRAGMENT}
  subscription SETTINGS_SUB {
    settings {
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
          powerLedOff
          nodeRpcPassword
          nodeEnableTor
          nodeUserConf
          nodeEnableSoloMining
          nodeMaxConnections
          nodeAllowLan
          btcsig
          nodeSoftware
          startdiff
        }
      }
      error {
        ...ErrorFragment
      }
    }
  }
`;
