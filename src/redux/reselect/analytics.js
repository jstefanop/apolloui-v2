import { createSelector } from 'reselect';
import { initialState } from '../../graphql/analytics';

const analyticsDataSelector = (state) => state.analytics.data;
const analyticsErrorSelector = (state) => state.analytics.error;
const analyticsLoadingSelector = (state) => state.analytics.loading;

export const analyticsSelector = createSelector(
  [analyticsDataSelector, analyticsErrorSelector, analyticsLoadingSelector],
  (analyticsData, analyticsError, analyticsLoading) => {
    const {
      TimeSeries: {
        stats: { error: errorStats, result },
      },
    } = analyticsData || initialState;

    const { data = [] } = result || [];

    const errors = [...[analyticsError, errorStats].filter(Boolean)];

    return {
      loading: analyticsLoading,
      error: errors,
      data: !errors.length && data,
    };
  }
);
