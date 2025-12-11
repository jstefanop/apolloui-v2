import { useMemo, useCallback } from 'react';

/**
 * Custom hook for memory-optimized analytics data management
 * Ensures data is limited and cleaned to prevent memory accumulation
 */
export const useAnalyticsData = (rawData) => {
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
  }, [rawData]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!limitedData.length) {
      return {
        labels: [],
        hashrates: [],
        poolhashrates: []
      };
    }

    return {
      labels: limitedData.map(item => item.date),
      hashrates: limitedData.map(item => item.hashrate),
      poolhashrates: limitedData.map(item => item.poolHashrate)
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