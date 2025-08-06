import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for memory-optimized polling
 * Prevents memory leaks by properly cleaning up intervals and references
 */
export const useMemoryOptimizedPolling = (callback, interval, dependencies = []) => {
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Start polling
  const startPolling = useCallback((pollingInterval) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, pollingInterval || interval);
  }, [interval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dependencies]);

  return { startPolling, stopPolling };
}; 