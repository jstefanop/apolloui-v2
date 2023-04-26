import { createSelector } from 'reselect';
import { initialState } from '../../graphql/mcu';

const mcuDataSelector = (state) => state.mcu.data;
const mcuErrorSelector = (state) => state.mcu.error;
const mcuLoadingSelector = (state) => state.mcu.loading;

export const mcuSelector = createSelector(
  [mcuDataSelector, mcuErrorSelector, mcuLoadingSelector],
  (mcuData, mcuError, mcuLoading) => {
    const {
      Mcu: {
        stats: {
          error: errorStats,
          result,
        },
      },
    } = mcuData || initialState;

    const {
      stats: mcuStats,
    } = result || {};

    const errors = [...[mcuError, errorStats].filter(Boolean)];

    return {
      loading: mcuLoading,
      error: errors,
      data: mcuStats,
    };
  }
);
