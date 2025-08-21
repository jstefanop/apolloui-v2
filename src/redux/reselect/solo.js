import { createSelector } from 'reselect';
import _ from 'lodash';
import { initialState } from '../../graphql/solo';
import { displayHashrate, convertHashrateStringToValue } from '../../lib/utils';
import moment from '../../lib/moment';

const soloDataSelector = (state) => state.solo.data;
const soloErrorSelector = (state) => state.solo.error;
const soloLoadingSelector = (state) => state.solo.loading;

export const soloSelector = createSelector(
  soloDataSelector,
  soloErrorSelector,
  soloLoadingSelector,
  (soloData, soloError, soloLoading) => {
    const {
      Solo: {
        status: { error: errorStatus, result: resultStatus },
        stats: { error: errorStats, result: resultStats },
      },
    } = soloData ?? initialState;

    const soloStatus = resultStatus?.status ?? null;
    const poolData = resultStats?.pool ?? null;
    const usersData = resultStats?.users ?? [];
    const blockFound = resultStats?.blockFound ?? false;
    const timestamp = resultStats?.timestamp ?? null;

    const errors = [...[soloError, errorStatus, errorStats].filter(Boolean)];

    // Calculate pool statistics
    let poolStats = null;
    if (poolData) {
      const {
        runtime,
        lastupdate,
        Users,
        Workers,
        Idle,
        Disconnected,
        hashrate1m,
        hashrate5m,
        hashrate15m,
        hashrate1hr,
        hashrate6hr,
        hashrate1d,
        hashrate7d,
        diff,
        accepted,
        rejected,
        bestshare,
        SPS1m,
        SPS5m,
        SPS15m,
        SPS1h,
      } = poolData;

      poolStats = {
        runtime,
        lastupdate,
        Users,
        Workers,
        Idle,
        Disconnected,
        hashrate1m,
        hashrate5m,
        hashrate15m,
        hashrate1hr,
        hashrate6hr,
        hashrate1d,
        hashrate7d,
        diff,
        accepted,
        rejected,
        bestshare,
        SPS1m,
        SPS5m,
        SPS15m,
        SPS1h,
      };
    }

    // Calculate users statistics
    let usersStats = [];
    if (usersData && usersData.length > 0) {
      usersStats = usersData.map((user) => {
        const {
          hashrate1m,
          hashrate5m,
          hashrate1hr,
          hashrate1d,
          hashrate7d,
          lastshare,
          workers,
          shares,
          bestshare,
          bestever,
          authorised,
          worker,
        } = user;

        return {
          hashrate1m,
          hashrate5m,
          hashrate1hr,
          hashrate1d,
          hashrate7d,
          lastshare,
          workers,
          shares,
          bestshare,
          bestever,
          authorised,
          worker: worker || [],
        };
      });
    }

    // Calculate summary statistics
    let summaryStats = null;
    if (poolData && usersData) {
      const totalUsers = usersData.length;
      const totalWorkers = usersData.reduce((sum, user) => sum + (user.workers || 0), 0);
      const totalShares = usersData.reduce((sum, user) => sum + (user.shares || 0), 0);
      const totalAccepted = poolData.accepted || 0;
      const totalRejected = poolData.rejected || 0;

      summaryStats = {
        totalUsers,
        totalWorkers,
        totalShares,
        totalAccepted,
        totalRejected,
        blockFound,
        timestamp,
      };
    }

    return {
      loading: soloLoading,
      error: errors.length > 0 ? errors[0] : null,
      data: {
        status: soloStatus,
        pool: poolStats,
        users: usersStats,
        summary: summaryStats,
        blockFound,
        timestamp,
      },
    };
  }
);

export default soloSelector;
