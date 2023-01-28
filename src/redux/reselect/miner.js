import { createSelector } from 'reselect';
import _ from 'lodash';
import { initialState } from '../../graphql/miner';
import { displayHashrate } from '../../lib/utils';

const minerDataSelector = (state) => state.miner.data;
const minerErrorSelector = (state) => state.miner.error;
const minerLoadingSelector = (state) => state.miner.loading;

export const minerSelector = createSelector(
  [minerDataSelector, minerErrorSelector, minerLoadingSelector],
  (minerData, minerError, minerLoading) => {
    const {
      Miner: {
        online: {
          error: errorOnline,
          result: {
            online: { status: minerOnline },
          },
        },
        stats: {
          error: errorStats,
          result: { stats: minerStats },
        },
      },
    } = minerData || initialState;

    const errors = [...[minerError, errorOnline, errorStats].filter(Boolean)];

    const stats = {
      boards: [],
      globalHashrate: null,
      globalAvgHashrate: null,
      minerPower: null,
      minerPowerPerGh: null,
      avgBoardTemp: null,
      avgBoardErrors: null,
    };

    if (minerStats) {
      stats.boards = minerStats.map((board) => {
        const {
          status,
          master: {
            boardsW: wattTotal,
            wattPerGHs,
            intervals: {
              int_900: { bySol: avgHashrateInGh },
            },
          },
          slots: {
            int_0: { ghs: hashrateInGh, temperature, errorRate },
          },
        } = board;

        return {
          status,
          wattPerGHs,
          wattTotal,
          hashrateInGh,
          avgHashrateInGh,
          temperature,
          errorRate,
        };
      });

      stats.globalHashrate = displayHashrate(
        _.sumBy(stats.boards, (hb) => {
          if (hb.status) return hb.hashrateInGh;
          return null;
        }),
        'gh',
        false,
        2,
        true
      );

      stats.globalAvgHashrate = displayHashrate(
        _.sumBy(stats.boards, (hb) => {
          if (hb.status) return hb.avgHashrateInGh;
          return null;
        }),
        'gh',
        false,
        2,
        true
      );

      // Miner watt
      stats.minerPower =
        _.chain(stats.boards)
          .filter((hb) => {
            return hb.status;
          })
          .meanBy((hb) => {
            return hb.wattTotal;
          })
          .value() || 0;

      stats.minerPowerPerGh =
        _.chain(stats.boards)
          .filter((hb) => {
            return hb.status;
          })
          .meanBy((hb) => {
            return hb.wattPerGHs;
          })
          .value() || 0;

      stats.avgBoardTemp = _.meanBy(stats.boards, (hb) => {
        if (hb.status) return hb.temperature;
        return null;
      });

      stats.avgBoardErrors = _.chain(stats.boards)
        .filter((hb) => {
          return hb.status;
        })
        .meanBy((hb) => {
          return hb.errorRate;
        })
        .value();
    }

    return {
      loading: minerLoading,
      error: errors,
      data: {
        online: !errors.length && minerOnline,
        stats: !errors.length && stats,
      },
    };
  }
);
