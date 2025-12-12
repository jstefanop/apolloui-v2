import { createSelector } from 'reselect';
import { initialSoloState } from '../../graphql/analytics';

const soloAnalyticsDataSelector = (state) => state.soloAnalytics?.data;
const soloAnalyticsErrorSelector = (state) => state.soloAnalytics?.error;
const soloAnalyticsLoadingSelector = (state) => state.soloAnalytics?.loading;

export const soloAnalyticsSelector = createSelector(
  soloAnalyticsDataSelector,
  soloAnalyticsErrorSelector,
  soloAnalyticsLoadingSelector,
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
