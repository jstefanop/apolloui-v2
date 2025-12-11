import { createSelector } from 'reselect';
import { initialStateWifi } from '../../graphql/mcu';

const wifiDataSelector = (state) => state.wifi.data;
const wifiErrorSelector = (state) => state.wifi.error;
const wifiLoadingSelector = (state) => state.wifi.loading;

export const wifiSelector = createSelector(
  wifiDataSelector,
  wifiErrorSelector,
  wifiLoadingSelector,
  (wifiData, wifiError, wifiLoading) => {
    const {
      Mcu: {
        wifiConnect: { error: errorStats, result: address },
      },
    } = wifiData ?? initialStateWifi;

    const errors = [wifiError, errorStats].filter(Boolean);

    return {
      loading: wifiLoading,
      error: errors,
      data: address,
    };
  }
);
