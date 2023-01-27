import { createSelector } from 'reselect';
import { initialState } from '../../graphql/miner';

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

    const errors = [
      ...[minerError, errorOnline, errorStats].filter(Boolean),
    ];

    let boards = [];

    if (minerStats)
      boards = minerStats.map((board) => {
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

    return {
      loading: minerLoading,
      error: errors,
      data: {
        online: !errors.length && minerOnline,
        stats: !errors.length && boards,
      }
    };
  }
);
