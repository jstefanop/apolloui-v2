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
    // Backend may return { Settings: null } on auth error before the JWT lands.
    // Fall back to the initial shape so the selector never throws.
    const source =
      settingsData && settingsData.Settings ? settingsData : initialState;
    const { error, result: settings } = source.Settings.read || {};

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
