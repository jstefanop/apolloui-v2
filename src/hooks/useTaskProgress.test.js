import { renderHook, act } from '@testing-library/react';
import { NetworkStatus } from '@apollo/client';
import { useTaskProgress } from './useTaskProgress';

// Drive the polled value directly; the hook only cares about selectProgress(data)
// and the poll cycle. `currentData` keeps a STABLE identity between renders (as
// Apollo does between polls whose results are deep-equal) and only changes inside
// poll(). What marks "the device answered" is the network-status cycle, not a new
// data object — with notifyOnNetworkStatusChange every poll re-renders through
// poll→ready even when the value (and so the data identity) is unchanged, and
// that transition is what feeds the watchdog.
let currentData;
let currentError;
let currentNetworkStatus;
jest.mock('@apollo/client', () => ({
  NetworkStatus: jest.requireActual('@apollo/client').NetworkStatus,
  useQuery: () => ({
    data: currentData,
    error: currentError,
    networkStatus: currentNetworkStatus,
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
  }),
}));

const select = (d) => d?.value;

// One full poll cycle answering `value` (undefined = a poll that FAILED — network
// error, no reading either way).
const poll = (rerender, value) => {
  act(() => {
    currentNetworkStatus = NetworkStatus.poll;
    rerender();
  });
  act(() => {
    if (value === undefined) {
      currentData = undefined;
      currentError = new Error('poll failed');
      currentNetworkStatus = NetworkStatus.error;
    } else {
      currentData = { value };
      currentError = null;
      currentNetworkStatus = NetworkStatus.ready;
    }
    rerender();
  });
};

// A poll that answered the SAME value: Apollo hands back the previous data object
// for a deep-equal result, so only the status cycles. The watchdog must treat
// this as "answered", not as silence.
const pollUnchanged = (rerender) => {
  act(() => {
    currentNetworkStatus = NetworkStatus.poll;
    rerender();
  });
  act(() => {
    currentNetworkStatus = NetworkStatus.ready;
    rerender();
  });
};

describe('useTaskProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    currentData = undefined;
    currentError = null;
    currentNetworkStatus = NetworkStatus.loading;
  });
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('reports success the moment a run is seen to reach 100', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 50);
    poll(rerender, 100); // terminal marker — no final 0 needed
    expect(result.current.outcome).toEqual({ status: 'success' });
    expect(result.current.isRunning).toBe(false);
    // The 100 persists on disk and keeps being read; it must not fire again.
    act(() => result.current.acknowledgeOutcome());
    poll(rerender, 100);
    expect(result.current.outcome).toBeNull();
  });

  it('reports success from the persistent 100 after a poll outage (throttled tab)', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 50); // run observed...
    poll(rerender, undefined); // ...then the tab is throttled: polls stop answering
    act(() => jest.advanceTimersByTime(60000)); // longer than any poll interval
    poll(rerender, 100); // first answer after refocus reads the persistent marker
    expect(result.current.outcome).toEqual({ status: 'success' });
    expect(result.current.isRunning).toBe(false);
  });

  it('reports failure when the marker vanishes before 100 (not success)', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 50); // running, never reached 100
    poll(rerender, 0); // marker gone
    // Still running during the grace — one 0 must not conclude.
    expect(result.current.isRunning).toBe(true);
    expect(result.current.outcome).toBeNull();
    act(() => jest.advanceTimersByTime(150));
    expect(result.current.outcome).toEqual({ status: 'failed' });
    expect(result.current.isRunning).toBe(false);
  });

  it('does not conclude if progress resumes before the grace elapses', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 50);
    poll(rerender, 0);
    act(() => jest.advanceTimersByTime(50));
    poll(rerender, 60); // progress came back
    act(() => jest.advanceTimersByTime(100));
    expect(result.current.outcome).toBeNull();
    expect(result.current.isRunning).toBe(true);
  });

  it('keeps the grace running through intermittent poll failures', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 40);
    poll(rerender, 0); // marker gone → grace armed
    act(() => jest.advanceTimersByTime(60));
    poll(rerender, undefined); // a failed poll (no reading) must not reset the grace
    act(() => jest.advanceTimersByTime(60)); // 120ms total > 100ms grace
    expect(result.current.outcome).toEqual({ status: 'failed' });
  });

  it('reports an explicit negative marker once', () => {
    const { result, rerender } = renderHook(() => useTaskProgress('q', select));
    poll(rerender, 30);
    poll(rerender, -2);
    expect(result.current.outcome).toEqual({ status: 'failed', code: -2 });
  });

  it('does not re-report a stale negative marker on a retry', () => {
    const { result, rerender } = renderHook(() => useTaskProgress('q', select));
    poll(rerender, 30);
    poll(rerender, -2); // run fails, marker left on disk
    expect(result.current.outcome).toEqual({ status: 'failed', code: -2 });

    act(() => result.current.acknowledgeOutcome());
    act(() => result.current.markSubmitted()); // user retries
    poll(rerender, -2); // first poll still sees the OLD marker
    expect(result.current.outcome).toBeNull(); // not re-reported

    poll(rerender, 20); // the new run writes its own progress
    poll(rerender, -1); // and then fails on its own
    expect(result.current.outcome).toEqual({ status: 'failed', code: -1 });
  });

  it('keeps the watchdog fed by polls that answer an unchanged value', () => {
    // Record isRunning on EVERY render: when the watchdog misfires the reading
    // re-latches it within a tick, so the damage is a transient drop — the
    // confirmation view (format button re-enabled) flashing mid-format — that an
    // end-state assertion cannot see.
    const seen = [];
    const { result, rerender } = renderHook(() => {
      const r = useTaskProgress('q', select, { stallMs: 1000 });
      seen.push(r.isRunning);
      return r;
    });
    poll(rerender, 10); // running — the worker sits at 10 while the node stops
    for (let i = 0; i < 5; i++) {
      act(() => jest.advanceTimersByTime(400)); // 2000ms total, well past stallMs
      pollUnchanged(rerender); // same data object — only the status cycles
    }
    // The device answered every time; an unchanged value is not silence — not
    // even for a single render.
    expect(result.current.isRunning).toBe(true);
    expect(result.current.outcome).toBeNull();
    const sinceRunning = seen.slice(seen.indexOf(true));
    expect(sinceRunning.every(Boolean)).toBe(true);
  });

  it('consumes a stale success marker from a previous session silently', () => {
    const { result, rerender } = renderHook(() => useTaskProgress('q', select));
    poll(rerender, 100); // marker left by a finished run nobody here watched
    expect(result.current.outcome).toBeNull();
    expect(result.current.isRunning).toBe(false);
  });

  it('does not credit a stale 100 to a new click', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100 })
    );
    poll(rerender, 100); // stale marker consumed on sight
    act(() => result.current.markSubmitted()); // user starts a new format
    poll(rerender, 100); // the worker has not overwritten the old marker yet
    expect(result.current.outcome).toBeNull(); // not this run's success

    poll(rerender, 20); // the new run writes its own progress
    poll(rerender, 100); // and reaches its own end
    expect(result.current.outcome).toEqual({ status: 'success' });
  });

  it('stays latched through an API-restart-length outage and resumes tracking', () => {
    // The update task restarts the backend: minutes of unanswered polls are the
    // NORMAL case for this hook, not a fault, and must not end the run.
    const { result, rerender } = renderHook(() => useTaskProgress('q', select));
    poll(rerender, 40);
    poll(rerender, undefined); // API restarting — polls fail
    act(() => jest.advanceTimersByTime(120000)); // two minutes of silence
    expect(result.current.isRunning).toBe(true); // still the same run
    poll(rerender, 55); // back up, task still going
    expect(result.current.isRunning).toBe(true);
    expect(result.current.outcome).toBeNull();
  });

  it('ends without a verdict when polls recover onto a bare 0 after an outage', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { zeroGraceMs: 100, outageMs: 10000 })
    );
    poll(rerender, 40); // running (a marker-deleting task: the system update)
    poll(rerender, undefined); // reboot — polls stop answering
    act(() => jest.advanceTimersByTime(30000));
    poll(rerender, 0); // back up, marker long gone: it finished either way
    expect(result.current.isRunning).toBe(false);
    act(() => jest.advanceTimersByTime(500)); // well past zeroGraceMs
    expect(result.current.outcome).toBeNull(); // and no false failure either
  });

  it('unlatches when the device stops answering (watchdog)', () => {
    const { result, rerender } = renderHook(() =>
      useTaskProgress('q', select, { stallMs: 1000 })
    );
    poll(rerender, 40); // running
    expect(result.current.isRunning).toBe(true);
    // The @auth progress read starts failing (token expired) — the device answers
    // nothing, so the sticky latch would otherwise never clear.
    poll(rerender, undefined);
    act(() => jest.advanceTimersByTime(1100));
    expect(result.current.isRunning).toBe(false);
    expect(result.current.outcome).toBeNull(); // silent fallback, no false outcome
  });

  it('clearSubmitted drops the latch without an outcome (failed launch)', () => {
    const { result } = renderHook(() => useTaskProgress('q', select));
    act(() => result.current.markSubmitted());
    expect(result.current.isRunning).toBe(true);
    act(() => result.current.clearSubmitted());
    expect(result.current.isRunning).toBe(false);
    expect(result.current.outcome).toBeNull();
  });

  it('resets the held progress on markSubmitted', () => {
    const { result, rerender } = renderHook(() => useTaskProgress('q', select));
    poll(rerender, 70);
    expect(result.current.progress).toBe(70);
    act(() => result.current.markSubmitted());
    poll(rerender, 0);
    expect(result.current.progress).toBe(0);
  });
});
