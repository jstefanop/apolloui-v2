import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';

/**
 * Progress of a long-running device task — formatting the node disk, updating
 * the system.
 *
 * The device is what knows whether one is running: the scripts write a marker
 * file as they go, and the API reports its contents, so a positive value means
 * "running" and the file disappearing means "finished". Reading that instead of
 * remembering it in React state is what lets the UI survive a page reload or the
 * modal being closed — the browser forgets, the device does not.
 *
 * Polling is slower while nothing is happening, so a modal that sits mounted on
 * every page does not ask twice a second forever.
 */
export const useTaskProgress = (query, selectProgress, { activeMs = 2000, idleMs = 10000 } = {}) => {
  const { data, startPolling, stopPolling } = useQuery(query, {
    fetchPolicy: 'no-cache',
  });

  const progress = selectProgress(data) ?? 0;
  const isRunning = progress > 0;

  const wasRunning = useRef(false);
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    startPolling(isRunning ? activeMs : idleMs);
    return () => stopPolling();
  }, [startPolling, stopPolling, isRunning, activeMs, idleMs]);

  useEffect(() => {
    if (isRunning) {
      wasRunning.current = true;
      return;
    }
    // Only a task we actually saw running can have finished; a plain zero at
    // startup just means nothing is going on.
    if (wasRunning.current) {
      wasRunning.current = false;
      setJustFinished(true);
    }
  }, [isRunning]);

  return {
    progress,
    isRunning,
    justFinished,
    acknowledgeFinish: () => setJustFinished(false),
  };
};
