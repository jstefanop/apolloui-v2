import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';

/**
 * Progress of a long-running device task — formatting the node disk, updating
 * the system.
 *
 * The device is what knows whether one is running: the scripts write a marker
 * file as they go, and the API reports its contents, so reading that instead of
 * remembering it in React state lets the UI survive a page reload or the dialog
 * being closed.
 *
 * Two things the file alone cannot say, and which this hook is careful about:
 *
 *  - **finished is not the same as succeeded.** The file disappears either way,
 *    so completion is only reported as success when the task was seen to reach
 *    100, and as failure when it vanished before that or reported a negative
 *    value. Announcing "done!" over a format that aborted at 10% is worse than
 *    saying nothing.
 *  - **a failed poll is not a finished task.** The API answers 0 for any read
 *    error, and the network drops during exactly the operations this watches, so
 *    only a reading that actually arrived counts as evidence.
 */
export const useTaskProgress = (
  query,
  selectProgress,
  { activeMs = 2000, idleMs = 10000, submittedGraceMs = 20000 } = {}
) => {
  const { data, error, startPolling, stopPolling } = useQuery(query, {
    fetchPolicy: 'no-cache',
  });

  const raw = selectProgress(data);
  const hasReading = !error && raw !== undefined && raw !== null;
  const value = hasReading ? raw : null;

  // Clicking the button starts the task before the next poll can see it. Without
  // this the control stays live for a whole interval, which is long enough to
  // press it twice and run two destructive jobs at once.
  const [submitted, setSubmitted] = useState(false);

  const seenRunning = useRef(false);
  const reachedEnd = useRef(false);
  const [outcome, setOutcome] = useState(null); // 'success' | 'failed'

  const isRunning = submitted || (hasReading && value > 0);
  const progress = hasReading && value > 0 ? value : 0;

  useEffect(() => {
    startPolling(isRunning ? activeMs : idleMs);
    return () => stopPolling();
  }, [startPolling, stopPolling, isRunning, activeMs, idleMs]);

  useEffect(() => {
    if (!hasReading) return; // a poll that failed says nothing either way

    if (value > 0) {
      seenRunning.current = true;
      setSubmitted(false); // the device has taken over from the click
      if (value >= 100) reachedEnd.current = true;
      // A script that hit trouble reports a negative value before clearing.
      return;
    }

    if (value < 0) {
      seenRunning.current = false;
      reachedEnd.current = false;
      setOutcome('failed');
      return;
    }

    if (seenRunning.current) {
      seenRunning.current = false;
      setOutcome(reachedEnd.current ? 'success' : 'failed');
      reachedEnd.current = false;
    }
  }, [hasReading, value]);

  // If the device never reports the task starting — the command failed, the
  // script died immediately — the latch has to let go, or the dialog stays stuck
  // claiming something is running that never did.
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setSubmitted(false), submittedGraceMs);
    return () => clearTimeout(timer);
  }, [submitted, submittedGraceMs]);

  const markSubmitted = useCallback(() => {
    setOutcome(null);
    setSubmitted(true);
  }, []);

  return {
    progress,
    isRunning,
    outcome,
    acknowledgeOutcome: useCallback(() => setOutcome(null), []),
    markSubmitted,
  };
};
