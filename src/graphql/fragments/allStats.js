import { gql } from '@apollo/client';

import { NODE_STATS_FRAGMENT } from './nodeStats';
import { MCU_STATS_FRAGMENT } from './mcuStats';
import { MINER_STATS_FRAGMENT } from './minerStats';

export const ALL_STATS_QUERY = gql`
  ${NODE_STATS_FRAGMENT}
  ${MCU_STATS_FRAGMENT}
  ${MINER_STATS_FRAGMENT}
  query {
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
    }
  }
`;