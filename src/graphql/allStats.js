import { gql } from '@apollo/client';

import { NODE_STATS_FRAGMENT } from './fragments/nodeStats';
import { MCU_STATS_FRAGMENT } from './fragments/mcuStats';
import { MINER_STATS_FRAGMENT } from './fragments/minerStats';
import { MINER_ONLINE_FRAGMENT } from './fragments/minerOnline';

export const ALL_STATS_QUERY = gql`
  ${NODE_STATS_FRAGMENT}
  ${MCU_STATS_FRAGMENT}
  ${MINER_STATS_FRAGMENT}
  ${MINER_ONLINE_FRAGMENT}
  query ALL_STATS {
    Node {
      stats {
        ...NodeStatsFragment
      }
    }
    Mcu {
      stats {
        ...McuStatsFragment
      }
    }
    Miner {
      stats {
        ...MinerStatsFragment
      }
      online {
        ...MinerOnlineFragment
      }
    }
  }
`;