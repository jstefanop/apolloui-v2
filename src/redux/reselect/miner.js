import { createSelector } from 'reselect';
import _ from 'lodash';
import { initialState } from '../../graphql/miner';
import { displayHashrate, convertHashrateStringToValue } from '../../lib/utils';
import moment from 'moment';

const minerDataSelector = (state) => state.miner.data;
const minerErrorSelector = (state) => state.miner.error;
const minerLoadingSelector = (state) => state.miner.loading;

export const minerSelector = createSelector(
  [minerDataSelector, minerErrorSelector, minerLoadingSelector],
  (minerData, minerError, minerLoading) => {
    const {
      Miner: {
        online: { error: errorOnline, result = {} },
        stats: { error: errorStats, result: resultStats },
      },
    } = minerData || initialState;

    const { stats: minerStats } = resultStats || {};

    let minerOnline = false;
    if (result?.online && result?.online?.status)
      minerOnline = result.online.status;

    const errors = [...[minerError, errorOnline, errorStats].filter(Boolean)];

    let stats;

    if (minerStats) {
      const boards = minerStats.map((board) => {
        const {
          status,
          lastsharetime,
          date,
          version,
          master: {
            boardsI: voltage,
            boardsW: wattTotal,
            wattPerGHs,
            upTime,
            intervals: {
              int_3600: {
                chipSpeed,
                bySol: avgHashrateInGh,
                byPool: avgPoolHashrateInGh,
              },
              int_30: { bySol: hashrateInGh },
            },
          },
          slots: {
            int_0: {
              // ghs: hashrateInGh,
              temperature,
              errorRate,
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
          ckpool: ckData,
        } = board;

        const poolHashrateInGh = avgPoolHashrateInGh;
        const { pool: ckPool, users: ckUsers } = ckData || {};

        const {
          runtime: ckRuntime,
          lastupdate: ckLastUpdate,
          Users: ckUsersCount,
          Workers: ckWorkersCount,
          hashrate1d: ckPoolHashrate1d,
          hashrate1hr: ckPoolHashrate1h,
          hashrate15m: ckPoolHashrate15m,
          hashrate5m: ckPoolHashrate5m,
          hashrate1m: ckPoolHashrate1m,
          bestshare: ckPoolBestshare,
          bestever: ckPoolBestever,
          Disconnected: ckDisconnected,
          Idle: ckIdle,
          accepted: ckSharesAccepted,
          rejected: ckSharesRejected,
        } = ckPool || {};

        const { worker: ckWorkers } = ckUsers || {};

        return {
          date,
          status,
          poolStatus,
          poolUsername,
          poolHost,
          poolPort,
          poolHashrateInGh,
          avgPoolHashrateInGh,
          upTime,
          version,
          lastShareTimeX: parseInt(moment(lastsharetime).format('X')),
          lastShareTime: moment(lastsharetime, 'X').fromNow(),
          wattPerGHs,
          wattTotal,
          hashrateInGh,
          avgHashrateInGh,
          efficiency: (wattTotal / avgHashrateInGh) * 1000,
          fanSpeed: _.mean(fanRpm),
          temperature,
          errorRate,
          chipSpeed,
          chips,
          sharesAccepted,
          sharesRejected,
          sharesSent,
          diff,
          voltage,
          soloMining: (ckData && true) || false,
          ckRuntime,
          ckLastUpdate,
          ckUsersCount,
          ckWorkersCount,
          ckPoolHashrate1m:
            ckPoolHashrate1m &&
            convertHashrateStringToValue(ckPoolHashrate1m),
          ckPoolHashrate15m:
            ckPoolHashrate15m &&
            convertHashrateStringToValue(ckPoolHashrate15m),
          ckPoolHashrate5m:
            ckPoolHashrate5m && convertHashrateStringToValue(ckPoolHashrate5m),
          ckPoolHashrate1d:
            ckPoolHashrate1d &&
            convertHashrateStringToValue(ckPoolHashrate1d, 'GH/s'),
          ckPoolHashrate1h:
            ckPoolHashrate1h &&
            convertHashrateStringToValue(ckPoolHashrate1h, 'GH/s'),
          ckPoolBestshare,
          ckPoolBestever,
          ckDisconnected:
            moment().diff(moment.unix(ckLastUpdate), 'seconds') > 90
              ? true
              : false,
          ckIdle,
          ckSharesAccepted,
          ckSharesRejected,
          ckWorkers,
        };
      });

      const maxBoardDate = _.maxBy(boards, 'date');

      const maxBoardByShareTime = _.maxBy(boards, 'lastShareTimeX');
      const maxLastShareTime = maxBoardByShareTime?.lastShareTimeX || null;
      const lastShareTime = maxLastShareTime
        ? moment(maxLastShareTime, 'X').fromNow()
        : null;

      const ckPoolDisconnected = _.some(boards, ['ckDisconnected', true]);

      const maxBoardsByCkPoolLastUpdate = _.maxBy(boards, 'ckLastUpdate');
      const maxCkPoolLastUpdate =
        maxBoardsByCkPoolLastUpdate?.ckLastUpdate || null;
      const ckPoolLastUpdate = maxCkPoolLastUpdate
        ? moment(maxCkPoolLastUpdate, 'X').fromNow()
        : null;

      const ckPoolTotalUsers = _.meanBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckUsersCount;
        return 0;
      });

      const ckPoolTotalWorkers = _.meanBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckWorkersCount;
        return 0;
      });

      const ckPoolTotalIdle = _.meanBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckIdle;
        return 0;
      });

      const ckPoolTotalSharesAccepted = _.sumBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckSharesAccepted;
        return 0;
      });

      const ckPoolTotalSharesRejected = _.sumBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckSharesRejected;
        return 0;
      });

      const ckPoolUptime = moment().to(
        moment().subtract(
          _.chain(boards)
            .filter((hb) => {
              return !hb.ckDisconnected;
            })
            .meanBy((hb) => {
              return hb.ckRuntime;
            })
            .value(),
          'seconds'
        ),
        true
      );

      const ckPoolGlobalHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (!hb.ckDisconnected) return hb.ckPoolHashrate1m;
          return null;
        }),
        'GH/s',
        false,
        2,
        true
      );

      const ckPoolGlobalAvgHashrate = displayHashrate(
        _.sumBy(boards, (hb) => {
          if (!hb.ckDisconnected) return hb.ckPoolHashrate1h;
          return null;
        }),
        'GH/s',
        false,
        2,
        true
      );

      const ckPoolGlobalHashrate1d = _.sumBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckPoolHashrate1d;
        return null;
      });

      const ckPoolGlobalHashrate1h = _.sumBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckPoolHashrate1h;
        return null;
      });

      const ckPoolGlobalBestshare = _.meanBy(boards, (hb) => {
        if (!hb.ckDisconnected) return hb.ckPoolBestshare;
        return 0;
      });

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
      const minerPower = _.sumBy(boards, (hb) => {
        if (hb.status) return hb.wattTotal;
        return 0;
      });

      const minerPowerPerGh = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.wattPerGHs;
        return 0;
      });

      // Board sum/avg
      let avgBoardEfficiency = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.efficiency;
        return null;
      });

      let avgBoardTemp = _.meanBy(boards, (hb) => {
        if (hb.status) return hb.temperature;
        return null;
      });

      if (isNaN(avgBoardTemp)) avgBoardTemp = 0;

      let avgBoardErrors = _.chain(boards)
        .filter((hb) => {
          return hb.status;
        })
        .meanBy((hb) => {
          return hb.errorRate;
        })
        .value();

      if (isNaN(avgBoardErrors)) avgBoardErrors = 0;

      let totalBoardRejected = _.sumBy(boards, (hb) => {
        if (hb.status && hb.sharesRejected) return hb.sharesRejected;
        return 0;
      });

      if (isNaN(totalBoardRejected)) totalBoardRejected = 0;

      let totalBoardAccepted = _.sumBy(boards, (hb) => {
        if (hb.status && hb.sharesAccepted) return hb.sharesAccepted;
        return 0;
      });

      if (isNaN(totalBoardAccepted)) totalBoardAccepted = 0;

      let avgChipSpeed = _.meanBy(boards, (hb) => {
        if (hb.status && hb.chipSpeed) return hb.chipSpeed;
        return 0;
      });

      if (isNaN(avgChipSpeed)) avgChipSpeed = 0;

      let avgFanSpeed = _.meanBy(boards, (hb) => {
        if (hb.status && hb.fanSpeed) return hb.fanSpeed;
        return 0;
      });

      if (isNaN(avgFanSpeed)) avgFanSpeed = 0;

      let avgVoltage = _.meanBy(boards, (hb) => {
        if (hb.status && hb.voltage) return hb.voltage;
        return 0;
      });

      if (isNaN(avgVoltage)) avgVoltage = 0;

      // Pool sum/avg
      const totalSharesSent = _.sumBy(boards, (hb) => {
        if (hb.status && hb.sharesSent) return hb.sharesSent;
        return 0;
      });

      const totalSharesAccepted = _.sumBy(boards, (hb) => {
        if (hb.status && hb.sharesAccepted) return hb.sharesAccepted;
        return 0;
      });

      const totalSharesRejected = _.sumBy(boards, (hb) => {
        if (hb.status && hb.sharesRejected) return hb.sharesRejected;
        return 0;
      });

      let avgDiff = _.meanBy(boards, (hb) => {
        if (hb.status && hb.diff) return hb.diff;
        return 0;
      });

      if (isNaN(avgDiff)) avgDiff = 0;

      const activeBoards = _.size(_.filter(boards, { status: true }));
      const totalBoards = _.size(boards);
      const activePools = _.size(_.filter(boards, { poolStatus: true }));

      stats = {
        date: maxBoardDate?.date || null,
        boards,
        minerUptime,
        globalHashrate,
        globalAvgHashrate,
        minerPower,
        minerPowerPerGh,
        avgBoardEfficiency,
        avgBoardTemp,
        avgBoardErrors,
        totalBoardAccepted,
        totalBoardRejected,
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
        ckPoolUptime,
        ckPoolLastUpdate,
        ckPoolTotalUsers,
        ckPoolTotalWorkers,
        ckPoolTotalIdle,
        ckPoolGlobalHashrate,
        ckPoolGlobalAvgHashrate,
        ckPoolGlobalHashrate1d,
        ckPoolGlobalHashrate1h,
        ckPoolGlobalBestshare,
        ckPoolDisconnected,
        ckPoolTotalSharesAccepted,
        ckPoolTotalSharesRejected,
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
