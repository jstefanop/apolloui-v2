import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

// Helper function to limit the solo analytics data to exactly 24 points and clean up memory
const limitSoloAnalyticsData = (data) => {
  if (!data || !data.TimeSeries || !data.TimeSeries.stats || !data.TimeSeries.stats.result || !data.TimeSeries.stats.result.data) {
    return data;
  }

  // Create a new object with only the necessary data to prevent memory accumulation
  const newData = {
    TimeSeries: {
      stats: {
        result: {
          data: []
        },
        error: data.TimeSeries.stats.error
      }
    }
  };

  // Limit to the most recent 24 data points and ensure data is clean
  const originalData = data.TimeSeries.stats.result.data;
  if (Array.isArray(originalData) && originalData.length > 0) {
    // Take only the last 24 items and ensure each item has only the necessary properties
    const limitedData = originalData.slice(-24).map(item => ({
      date: item.date,
      users: item.users || 0,
      workers: item.workers || 0,
      idle: item.idle || 0,
      disconnected: item.disconnected || 0,
      hashrate15m: item.hashrate15m || 0,
      accepted: item.accepted || 0,
      rejected: item.rejected || 0,
      bestshare: item.bestshare || 0
    }));
    
    newData.TimeSeries.stats.result.data = limitedData;
  }

  return newData;
};

const soloAnalyticsSlice = createSlice({
  name: 'soloAnalytics',
  initialState,
  reducers: {
    updateSoloAnalytics: (state, action) => {
      // Apply the limit to the data before storing it
      state.data = action.payload.data ? limitSoloAnalyticsData(action.payload.data) : null;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
    // Add a cleanup action to clear data when needed
    clearSoloAnalytics: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    // Add an action to set loading without clearing data
    setSoloAnalyticsLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { updateSoloAnalytics, clearSoloAnalytics, setSoloAnalyticsLoading } = soloAnalyticsSlice.actions;
export default soloAnalyticsSlice.reducer;
