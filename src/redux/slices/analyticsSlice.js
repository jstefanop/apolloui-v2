import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateAnalytics: (state, action) => {
      // Limit the size of stored data
      const MAX_DATA_POINTS = 48; // Store up to 48 data points (e.g., 2 days worth of hourly data)

      const newData = action.payload.data;

      // Store the last update timestamp
      state.lastUpdated = new Date().toISOString();

      // Handle data limiting
      if (newData && newData.TimeSeries &&
        newData.TimeSeries.stats &&
        newData.TimeSeries.stats.result &&
        newData.TimeSeries.stats.result.data) {

        const incomingData = newData.TimeSeries.stats.result.data;

        if (Array.isArray(incomingData) && incomingData.length > MAX_DATA_POINTS) {
          // Sort by date (newest first) and limit to MAX_DATA_POINTS
          const sortedData = [...incomingData].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
          );

          const limitedData = sortedData.slice(0, MAX_DATA_POINTS);

          // Create a new object with limited data
          const limitedPayload = {
            ...action.payload,
            data: {
              ...newData,
              TimeSeries: {
                ...newData.TimeSeries,
                stats: {
                  ...newData.TimeSeries.stats,
                  result: {
                    ...newData.TimeSeries.stats.result,
                    data: limitedData
                  }
                }
              }
            }
          };

          // Update state with limited data
          state.data = limitedPayload.data;
          state.loading = limitedPayload.loading;
          state.error = limitedPayload.error;
        } else {
          // If data is already within limits, update normally
          state.data = action.payload.data;
          state.loading = action.payload.loading;
          state.error = action.payload.error;
        }
      } else {
        // If data structure is not as expected, update normally
        state.data = action.payload.data;
        state.loading = action.payload.loading;
        state.error = action.payload.error;
      }
    },
    clearAnalyticsData: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { updateAnalytics, clearAnalyticsData } = analyticsSlice.actions;
export default analyticsSlice.reducer;