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
        const {
          status,
          lastsharetime,
          master: {
            boardsW: wattTotal,
            wattPerGHs,
            upTime,
            intervals: {
              int_900: { bySol: avgHashrateInGh, byPool: avgPoolHashrateInGh },
              int_0: { chipSpeed, byPool: poolHashrateInGh },
            },
          },
          slots: {
            int_0: {
              ghs: hashrateInGh,
              temperature,
              errorRate,
              currents,
              chips,
            },
          },
          pool: {
            diff,
            status: poolStatus,
            userName: poolUsername,
            host: poolHost,
            port: poolPort,
            intervals: {
              int_0: { sharesRejected, sharesAccepted, sharesSent },
            },
          },
          fans: {
            int_0: { rpm: fanRpm },
          },
        } = board;

        return {
          status,
          poolStatus,
          poolUsername,
          poolHost,
          poolPort,
          poolHashrateInGh,
          avgPoolHashrateInGh,
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
          chips,
          sharesAccepted,
          sharesRejected,
          sharesSent,
          diff,
          voltage: status
            ? (((wattPerGHs * hashrateInGh) / _.sum(currents)) * 1000).toFixed(
                2
              )
            : 0,
        };
      });

      const maxBoardByShareTime = _.maxBy(boards, 'lastShareTimeX');
      const maxLastShareTime = maxBoardByShareTime?.lastShareTimeX || null;
      const lastShareTime = (maxLastShareTime) ? moment(maxLastShareTime, 'X').fromNow() : null;

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

      if (_.every(boards, ['status', false])) minerUptime = 'Inactive';

      const globalHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.hashrateInGh;
          return null;
        }),
        'GH/s',
        false,
        2,
        true
      );

      const globalAvgHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.avgHashrateInGh;
          return null;
        }),
        'GH/s',
        false,
        2,
        true
      );

      const poolHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.poolHashrateInGh;
          return null;
        }),
        'GH/s',
        true,
        2
      );

      const poolHAvgashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (hb.status) return hb.poolHashrateInGh;
          return null;
        }),
        'GH/s',
        true,
        2
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

      const avgVoltage = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.voltage;
        return null;
      });

      // Pool sum/avg
      const totalSharesSent = _.sumBy(boards, (hb) => {
        if (hb.status) return hb.sharesSent;
        return null;
      });

      const totalSharesAccepted = _.sumBy(boards, (hb) => {
        if (hb.status) return hb.sharesAccepted;
        return null;
      });

      const totalSharesRejected = _.sumBy(boards, (hb) => {
        if (hb.status) return hb.sharesRejected;
        return null;
      });

      const avgDiff = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.diff;
        return null;
      });

      const activeBoards = _.size(_.filter(boards, { status: true }));
      const totalBoards = _.size(boards);
      const activePools = _.size(_.filter(boards, { poolStatus: true }));

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
        avgVoltage,
        lastShareTime,
        totalSharesSent,
        totalSharesAccepted,
        totalSharesRejected,
        avgDiff,
        poolHashrate,
        poolHAvgashrate,
        activeBoards,
        totalBoards,
        activePools,
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
