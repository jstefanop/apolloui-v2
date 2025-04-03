import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

// Helper function to limit the analytics data to exactly 24 points
const limitAnalyticsData = (data) => {
  if (!data || !data.TimeSeries || !data.TimeSeries.stats || !data.TimeSeries.stats.result || !data.TimeSeries.stats.result.data) {
    return data;
  }

  // Create a deep copy of the data to avoid mutating the original
  const newData = JSON.parse(JSON.stringify(data));

  // Limit to the most recent 24 data points
  if (newData.TimeSeries.stats.result.data.length > 24) {
    newData.TimeSeries.stats.result.data = newData.TimeSeries.stats.result.data.slice(-24);
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
  },
});

export const { updateAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;