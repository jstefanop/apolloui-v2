import { createSelector } from 'reselect';
import { initialState } from '../../graphql/analytics';

const analyticsDataSelector = (state) => state.analytics.data;
const analyticsErrorSelector = (state) => state.analytics.error;
const analyticsLoadingSelector = (state) => state.analytics.loading;

export const analyticsSelector = createSelector(
  analyticsDataSelector,
  analyticsErrorSelector,
  analyticsLoadingSelector,
  (analyticsData, analyticsError, analyticsLoading) => {
    const {
      TimeSeries: {
        stats: { error: errorStats, result },
      },
    } = analyticsData || initialState;

    // Get data and ensure it's limited to the most recent 24 elements
    let data = result?.data || [];
    if (data.length > 24) {
      data = data.slice(-24);
    }

    const errors = [...[analyticsError, errorStats].filter(Boolean)];

    return {
      loading: analyticsLoading,
      error: errors,
      data: !errors.length && data,
    };
  }
);