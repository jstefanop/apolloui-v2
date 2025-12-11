import { createSelector } from 'reselect';
import { initialState } from '../../graphql/settings';

const settingsDataSelector = (state) => state.settings.data;
const settingsErrorSelector = (state) => state.settings.error;
const settingsLoadingSelector = (state) => state.settings.loading;

export const settingsSelector = createSelector(
  settingsDataSelector,
  settingsErrorSelector,
  settingsLoadingSelector,
  (settingsData, settingsError, settingsLoading) => {
    const {
      Settings: {
        read: { error, result: settings },
      },
    } = settingsData ?? initialState;

    const errors = [settingsError, error].filter(Boolean);

    const data = settings?.settings
      ? {
          ...settings.settings,
          fanHigh: settings.settings.fan_high,
          fanLow: settings.settings.fan_low,
        }
      : {};

    return {
      loading: settingsLoading,
      error: errors,
      data: data,
    };
  }
);
