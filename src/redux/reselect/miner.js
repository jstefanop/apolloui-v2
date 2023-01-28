import { createSelector } from 'reselect';
import _ from 'lodash';
import { initialState } from '../../graphql/miner';
import { displayHashrate } from '../../lib/utils';
import moment from 'moment';

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

    let stats;

    if (minerStats) {
      const boards = minerStats.map((board) => {
        console.log(board);
        const {
          status,
          lastsharetime,
          master: {
            boardsW: wattTotal,
            wattPerGHs,
            upTime,
            intervals: {
              int_900: { bySol: avgHashrateInGh },
              int_0: { chipSpeed }
            },
          },
          slots: {
            int_0: { ghs: hashrateInGh, temperature, errorRate },
          },
          pool: {
            intervals: {
              int_0: { sharesRejected, sharesAccepted },
            },
          },
          fans: {
            int_0: { rpm: fanRpm}
          }
        } = board;

        return {
          status,
          upTime,
          lastShareTimeX: parseInt(moment(lastsharetime).format('X')),
          lastShareTime: moment(lastsharetime, 'X').fromNow(),
          wattPerGHs,
          wattTotal,
          hashrateInGh,
          avgHashrateInGh,
          fanSpeed: _.mean(fanRpm),
          temperature,
          errorRate,
          chipSpeed,
          sharesAccepted,
          sharesRejected,
        };
      });

      const maxBoardByShareTime = _.maxBy(boards, 'lastShareTimeX');
      const maxLastShareTime = maxBoardByShareTime.lastShareTimeX;
      const lastShareTime = moment(maxLastShareTime, 'X').fromNow();

      let minerUptime = moment().to(
        moment().subtract(
          _.chain(boards)
            .filter((hb) => {
              return hb.status;
            })
            .meanBy((hb) => {
              return hb.upTime;
            })
            .value(),
          'seconds'
        ),
        true
      );

      if (_.every(boards, ['status', false]))
        minerUptime = 'Inactive';

      const globalHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.hashrateInGh;
          return null;
        }),
        'gh',
        false,
        2,
        true
      );

      const globalAvgHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.avgHashrateInGh;
          return null;
        }),
        'gh',
        false,
        2,
        true
      );

      // Miner watt
      const minerPower =
        _.chain(boards)
          .filter((hb) => {
            return hb.status;
          })
          .meanBy((hb) => {
            return hb.wattTotal;
          })
          .value() || 0;

      const minerPowerPerGh =
        _.chain(boards)
          .filter((hb) => {
            return hb.status;
          })
          .meanBy((hb) => {
            return hb.wattPerGHs;
          })
          .value() || 0;

      const avgBoardTemp = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.temperature;
        return null;
      });

      const avgBoardErrors = _.chain(boards)
        .filter((hb) => {
          return hb.status;
        })
        .meanBy((hb) => {
          return hb.errorRate;
        })
        .value();

      const avgBoardRejected = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.sharesRejected;
        return null;
      });

      const avgChipSpeed = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.chipSpeed;
        return null;
      });

      const avgFanSpeed = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.fanSpeed;
        return null;
      });

      stats = {
        boards,
        minerUptime,
        globalHashrate,
        globalAvgHashrate,
        minerPower,
        minerPowerPerGh,
        avgBoardTemp,
        avgBoardErrors,
        avgBoardRejected,
        avgChipSpeed,
        avgFanSpeed,
        lastShareTime,
      };
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
