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
    // Early return if no data
    if (!analyticsData) {
      return {
        loading: analyticsLoading,
        error: analyticsError ? [analyticsError] : [],
        data: null,
      };
    }

    const {
      TimeSeries: {
        stats: { error: errorStats, result },
      },
    } = analyticsData;

    // Get data and ensure it's limited to the most recent 24 elements
    let data = result?.data || [];
    
    // Additional safety check to prevent memory accumulation
    if (Array.isArray(data) && data.length > 24) {
      data = data.slice(-24);
    }

    // Filter out any null/undefined errors
    const errors = [analyticsError, errorStats].filter(Boolean);

    return {
      loading: analyticsLoading,
      error: errors,
      data: !errors.length && data.length > 0 ? data : null,
    };
  }
);