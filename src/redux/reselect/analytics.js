import { createSelector } from 'reselect';
import { initialState } from '../../graphql/analytics';

const analyticsDataSelector = (state) => state.analytics.data;
const analyticsErrorSelector = (state) => state.analytics.error;
const analyticsLoadingSelector = (state) => state.analytics.loading;

export const analyticsSelector = createSelector(
  [analyticsDataSelector, analyticsErrorSelector, analyticsLoadingSelector],
  (analyticsData, analyticsError, analyticsLoading) => {
    const {
      analytics: {
        stats: { error: errorStats, result },
      },
    } = analyticsData || initialState;

    const { data: analyticsData = {} } = result || {};

    const { error } = analyticsData;

    const errors = [...[analyticsError, error, errorStats].filter(Boolean)];

    return {
      loading: analyticsLoading,
      error: errors,
      data: !errors.length && analyticsData,
    };
  }
);
