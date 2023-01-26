import { createSelector } from 'reselect';
import { initialState } from '../../graphql/navbarStats';

const navbarStatsDataSelector = (state) => state.navbarStats.data;
const navbarStatsErrorSelector = (state) => state.navbarStats.error;

export const navbarStatsSelector = createSelector(
  [navbarStatsDataSelector, navbarStatsErrorSelector],
  (navbarStatsData, navbarStatsError) => {
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
      Node: {
        stats: {
          result: { stats: nodeStats },
        },
      },
    } = navbarStatsData || initialState;

    const errors = [
      ...[navbarStatsError, errorOnline, errorStats].filter(Boolean),
    ];
    return {
      error: errors,
      data: {
        online: !errors.length && minerOnline,
        stats: !errors.length && minerStats,
        nodeStats
      },
    };
  }
);
