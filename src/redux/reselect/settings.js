import { createSelector } from 'reselect';
import { initialState } from '../../graphql/settings';

const settingsDataSelector = (state) => state.settings.data;
const settingsErrorSelector = (state) => state.settings.error;
const settingsLoadingSelector = (state) => state.settings.loading;

export const settingsSelector = createSelector(
  [settingsDataSelector, settingsErrorSelector, settingsLoadingSelector],
  (settingsData, settingsError, settingsLoading) => {
    
    const {
      Settings: {
        read: {
          error,
          result: { settings },
        },
      },
    } = settingsData?.Settings ? settingsData : initialState;

    const errors = [...[settingsError, error].filter(Boolean)];

    let data;
    if (settings) {
      const { fan_high: fanHigh, fan_low: fanLow } = settings;
      data = {
        ...settings,
        fanHigh,
        fanLow,
      };
    }

    return {
      loading: settingsLoading,
      error: errors,
      data: data,
    };
  }
);
