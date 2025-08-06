import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

// Helper function to limit the analytics data to exactly 24 points and clean up memory
const limitAnalyticsData = (data) => {
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
      hashrate: item.hashrate || 0,
      accepted: item.accepted || 0,
      poolHashrate: item.poolHashrate || 0,
      rejected: item.rejected || 0,
      sent: item.sent || 0,
      errors: item.errors || 0,
      watts: item.watts || 0,
      temperature: item.temperature || 0,
      voltage: item.voltage || 0,
      chipSpeed: item.chipSpeed || 0,
      fanRpm: item.fanRpm || 0
    }));
    
    newData.TimeSeries.stats.result.data = limitedData;
  }

  return newData;
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateAnalytics: (state, action) => {
      // Apply the limit to the data before storing it
      state.data = action.payload.data ? limitAnalyticsData(action.payload.data) : null;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
    // Add a cleanup action to clear data when needed
    clearAnalytics: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    // Add an action to set loading without clearing data
    setAnalyticsLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { updateAnalytics, clearAnalytics, setAnalyticsLoading } = analyticsSlice.actions;
export default analyticsSlice.reducer;