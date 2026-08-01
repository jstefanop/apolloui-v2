import { useCallback, useEffect, useRef, useState } from 'react';
import { NetworkStatus, useQuery } from '@apollo/client';

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
 *  - **finished is not the same as succeeded.** Success is a reading of 100 and
 *    failure a negative reading — terminal values the scripts leave in place, so
 *    completion survives a poller that was throttled, disconnected, or opened
 *    later. A marker gone mid-run (a 0 after progress, no terminal value seen)
 *    is a failure: announcing "done!" over a format that aborted at 10% is
 *    worse than saying nothing. And because terminal markers persist, they are
 *    consumed once and only credited to a run this hook saw start.
 *  - **a failed poll is not a finished task.** The API answers 0 for any read
 *    error, and the network drops during exactly the operations this watches, so
 *    only a reading that actually arrived counts as evidence.
 *
 * The idle rate is the one that matters for cost: these hooks sit mounted on
 * every page — the update dialog lives in the navbar — so it is what the device
 * pays all day. It only has to be quick enough to notice a task somebody started
 * in another tab.
 */
export const useTaskProgress = (
  query,
  selectProgress,
  {
    activeMs = 2000,
    idleMs = 60000,
    submittedGraceMs = 20000,
    zeroGraceMs = 6000,
    stallMs = 600000,
    outageMs = 10000,
  } = {}
) => {
  const { data, error, networkStatus, startPolling, stopPolling } = useQuery(
    query,
    {
      fetchPolicy: 'no-cache',
      // Every poll must be OBSERVABLE, not only the ones that change the value:
      // Apollo suppresses re-renders for deep-equal results, so during a long
      // plateau (the format sits at 10 across stop-node + wipefs) nothing here
      // would run and the watchdog below could not tell "alive but slow" from
      // "stopped answering". Status transitions re-render on every poll cycle
      // regardless of the data.
      notifyOnNetworkStatusChange: true,
    }
  );

  const raw = selectProgress(data);
  const hasReading = !error && raw !== undefined && raw !== null;
  const value = hasReading ? raw : null;

  // Clicking the button starts the task before the next poll can see it. Without
  // this the control stays live for a whole interval, which is long enough to
  // press it twice and run two destructive jobs at once.
  const [submitted, setSubmitted] = useState(false);

  // "active" is sticky: once a poll has seen the task running it stays true until
  // a DEFINITIVE end — 100 (success), a negative marker (failure), a vanished
  // marker (incomplete), or the device going silent for good (the watchdog). It is
  // state, not a ref, so isRunning can depend on it and the dialog does not flicker
  // back to the confirmation view on a transient 0 (the API answers {value: 0} for
  // a read error too, indistinguishable from "file gone").
  const [active, setActive] = useState(false);
  // Set when a running task reads 0 without having reached 100: the marker is gone
  // but we never saw completion. Kept as state, not derived from the live reading,
  // so intermittent poll failures do not keep restarting the grace below.
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  // Terminal markers persist on disk, so each outcome is reported at most once:
  // the ref stays set while the stale reading repeats (across sessions too) and
  // only a fresh sub-100 progress reading re-arms it.
  const reportedFailure = useRef(false);
  const reportedSuccess = useRef(false);
  const [lastProgress, setLastProgress] = useState(0);
  const [outcome, setOutcome] = useState(null); // 'success' | 'failed'

  // Bumped on every poll that actually answered, so the watchdog can tell the
  // difference between "the task is slow" and "the device stopped replying".
  // Keyed on the network status, NOT on data: data keeps the same identity while
  // the reported value is unchanged, and a plateau must still count as answering.
  // answerGap records how long this answer waited on the previous one, so the
  // reading effect can tell a 0 read under continuous observation from a 0 read
  // first thing after an outage.
  const [readingSeq, setReadingSeq] = useState(0);
  const lastAnsweredAt = useRef(null);
  const answerGap = useRef(0);
  useEffect(() => {
    if (networkStatus === NetworkStatus.ready && !error) {
      const now = Date.now();
      answerGap.current =
        lastAnsweredAt.current === null ? 0 : now - lastAnsweredAt.current;
      lastAnsweredAt.current = now;
      setReadingSeq((n) => n + 1);
    }
  }, [networkStatus, error]);

  const isRunning = submitted || active;
  // Progress only means something for the run being shown: while running, hold
  // the last real value through a transient 0 so the bar does not blank; when
  // idle, report 0 even though a persistent terminal marker may still read 100.
  const progress = !isRunning
    ? 0
    : hasReading && value > 0
      ? Math.min(value, 100)
      : lastProgress;

  useEffect(() => {
    startPolling(isRunning ? activeMs : idleMs);
    return () => stopPolling();
  }, [startPolling, stopPolling, isRunning, activeMs, idleMs]);

  useEffect(() => {
    if (!hasReading) return; // a poll that failed says nothing either way

    if (value >= 100) {
      // Terminal success, the moment it is seen: the marker stays at 100 on
      // disk, so waiting for a final 0 (as this hook once did) is not needed —
      // and a reading that repeats, possibly from before this session, must be
      // consumed once and credited only to a run this hook saw submitted or
      // running. A stale 100 is consumed silently, so a later click cannot
      // inherit it as its own success.
      if (!reportedSuccess.current) {
        reportedSuccess.current = true;
        if (active || submitted) {
          setActive(false);
          setSubmitted(false);
          setAwaitingEnd(false);
          setLastProgress(0);
          setOutcome({ status: 'success' });
        }
      }
      return;
    }

    if (value > 0) {
      setActive(true);
      setSubmitted(false); // the device has taken over from the click
      setAwaitingEnd(false); // progress resumed — not ending after all
      setLastProgress(value); // updated here, not in render (render must be pure)
      reportedFailure.current = false; // a genuinely new run re-arms both outcomes
      reportedSuccess.current = false;
      return;
    }

    if (value < 0) {
      // A failed script writes a negative marker and leaves it, so this reading
      // repeats every poll — fire the outcome once, or the failure toast replays
      // forever (to later sessions too). The magnitude says how far it got.
      setActive(false);
      setAwaitingEnd(false);
      if (!reportedFailure.current) {
        reportedFailure.current = true;
        setOutcome({ status: 'failed', code: value });
      }
      return;
    }

    // value === 0: the marker is gone with no terminal value. Read under
    // continuous observation that means the task ended without finishing — a
    // FAILURE (the grace effect concludes it, so one stray 0 does not; saying
    // "done" over a half-wiped disk is the worst outcome). Read first thing
    // after a poll outage it means nothing: a marker-deleting task (the system
    // update ends in rm + reboot) may have finished either way during the
    // silence, so conclude neither — unlatch back to idle without an outcome.
    if (active) {
      if (answerGap.current > outageMs) {
        setActive(false);
        setAwaitingEnd(false);
        setLastProgress(0);
      } else {
        setAwaitingEnd(true);
      }
    }
    // `submitted` is read above but deliberately not a dependency: it is only
    // consulted when a reading transitions (deps below), and the latest closure
    // is what runs then. As a dep, the click itself would re-run this effect
    // against the still-stale reading and re-latch it (progress bar and
    // submitted state) the instant markSubmitted reset them.
  }, [hasReading, value, active, outageMs]);

  // The marker vanished before 100 and stayed gone: conclude failure after a short
  // grace so a single bad read does not. Keyed on awaitingEnd (a state a real
  // reading sets), NOT on the live reading, so intermittent poll failures do not
  // tear the timer down and restart it — the task would otherwise never conclude.
  useEffect(() => {
    if (!awaitingEnd) return;
    const timer = setTimeout(() => {
      setActive(false);
      setAwaitingEnd(false);
      setLastProgress(0);
      if (!reportedFailure.current) {
        reportedFailure.current = true;
        setOutcome({ status: 'failed' }); // no code: incomplete, not a script -1/-2
      }
    }, zeroGraceMs);
    return () => clearTimeout(timer);
  }, [awaitingEnd, zeroGraceMs]);

  // Watchdog: a sticky "active" that only a reading can clear would latch the
  // dialog into "running" forever if polling stops answering for good — an
  // expired token on the @auth progress query, a backend that never comes back.
  // Re-armed on every poll that answered (readingSeq), so a slow-but-alive task
  // never trips it. The delay is LONG on purpose: outages are the normal face of
  // the tasks this hook watches — the update restarts the API and ends in a
  // reboot, a format rides out minutes of a throttled background tab — and with
  // terminal markers persisting on disk, the first answer after any recovered
  // outage concludes the run properly. The watchdog exists only for the outage
  // that never ends; firing during a survivable one would end the run silently.
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setActive(false);
      setAwaitingEnd(false);
    }, stallMs);
    return () => clearTimeout(timer);
  }, [active, readingSeq, stallMs]);

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
    setAwaitingEnd(false);
    setLastProgress(0);
    // reportedFailure/reportedSuccess are deliberately NOT reset here: the
    // previous run's terminal marker is still on disk until this run overwrites
    // it, so re-arming now would credit the OLD outcome to the retry's first
    // poll. The 0<value<100 branch re-arms both once this run actually writes
    // progress.
  }, []);

  // Un-latch the click without reporting an outcome, for when the launch itself
  // failed: leaving `submitted` set would keep the dialog in the running view (with
  // the retry button disabled) for the whole grace, contradicting the error toast.
  const clearSubmitted = useCallback(() => setSubmitted(false), []);

  return {
    progress,
    isRunning,
    outcome,
    acknowledgeOutcome: useCallback(() => setOutcome(null), []),
    markSubmitted,
    clearSubmitted,
  };
};
