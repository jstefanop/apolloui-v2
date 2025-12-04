import { useMemo, useCallback } from 'react';

/**
 * Custom hook for memory-optimized solo analytics data management
 * Ensures data is limited and cleaned to prevent memory accumulation
 */
export const useSoloAnalyticsData = (rawData) => {
  // Memoize and limit the data to prevent memory accumulation
  const limitedData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }
    
    // Take only the last 24 items to prevent memory accumulation
    const limited = rawData.slice(-24);
    
    // Clean each data point to ensure only necessary properties are kept
    return limited.map(item => ({
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
  }, [rawData]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!limitedData.length) {
      return {
        labels: [],
        hashrates: [],
        workers: []
      };
    }

    return {
      labels: limitedData.map(item => item.date),
      hashrates: limitedData.map(item => item.hashrate15m),
      workers: limitedData.map(item => item.workers)
    };
  }, [limitedData]);

  // Function to get data for specific time range
  const getDataForRange = useCallback((hours = 24) => {
    if (!limitedData.length) return [];
    
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    return limitedData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffTime;
    });
  }, [limitedData]);

  return {
    data: limitedData,
    chartData,
    getDataForRange,
    dataLength: limitedData.length
  };
};
