import { renderHook, act } from '@testing-library/react';
import { FormatTaskProvider, useFormatTask } from './FormatTaskContext';

// The context owns the format lifecycle; what these tests pin down is the launch
// error handling — when the submitted latch may be dropped and when it must NOT
// be. Everything around it (polling, redux, apollo) is mocked at the seams.

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));

// No IntlProvider in the harness: formatMessage echoes the id, which is all the
// assertions need. The intl object is a stable singleton, as react-intl's is —
// a fresh one per render would defeat the provider's memoization for reasons
// the real app never has.
jest.mock('react-intl', () => {
  const mockIntl = { formatMessage: ({ id }) => id };
  return { useIntl: () => mockIntl };
});

const mockTask = {
  progress: 0,
  isRunning: false,
  outcome: null,
  acknowledgeOutcome: jest.fn(),
  markSubmitted: jest.fn(),
  clearSubmitted: jest.fn(),
};
jest.mock('../hooks/useTaskProgress', () => ({
  useTaskProgress: () => mockTask,
}));

// The mutate function is identity-stable across renders, as Apollo's is.
let mutateImpl;
const mockMutate = (...args) => mutateImpl(...args);
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: () => [mockMutate],
}));

const wrapper = ({ children }) => (
  <FormatTaskProvider>{children}</FormatTaskProvider>
);
const renderCtx = () => renderHook(() => useFormatTask(), { wrapper });

describe('FormatTaskContext.startFormat launch errors', () => {
  it('keeps the submitted latch when the response is lost in transit', async () => {
    // The backend may have spawned the worker with the reply lost: unlatching
    // would drop polling to the idle interval, wide enough to miss the whole
    // format. The 20s submitted grace is the observation window instead.
    const err = Object.assign(new Error('Failed to fetch'), {
      networkError: new Error('Failed to fetch'),
    });
    mutateImpl = () => Promise.reject(err);

    const { result } = renderCtx();
    await act(() => result.current.startFormat());

    expect(mockTask.markSubmitted).toHaveBeenCalled();
    expect(mockTask.clearSubmitted).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ type: 'error' }),
      })
    );
  });

  it('unlatches when the backend answers with a GraphQL error', async () => {
    const err = Object.assign(new Error('unauthorized'), {
      graphQLErrors: [{ message: 'unauthorized' }],
      networkError: null,
    });
    mutateImpl = () => Promise.reject(err);

    const { result } = renderCtx();
    await act(() => result.current.startFormat());

    expect(mockTask.clearSubmitted).toHaveBeenCalled();
  });

  it('unlatches when the resolver reports the launch was refused', async () => {
    mutateImpl = () =>
      Promise.resolve({
        data: {
          Node: {
            format: { error: { message: 'a format is already running' } },
          },
        },
      });

    const { result } = renderCtx();
    await act(() => result.current.startFormat());

    expect(mockTask.clearSubmitted).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ type: 'error' }),
      })
    );
  });

  it('keeps the latch and reports the start on success', async () => {
    mutateImpl = () =>
      Promise.resolve({ data: { Node: { format: { error: null } } } });

    const { result } = renderCtx();
    await act(() => result.current.startFormat());

    expect(mockTask.clearSubmitted).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ type: 'info' }),
      })
    );
  });
});

describe('FormatTaskContext value identity', () => {
  it('keeps the context value stable across unrelated provider re-renders', () => {
    // The provider re-renders on every poll cycle; a fresh value object each
    // time would drag every consumer along with it.
    const { result, rerender } = renderCtx();
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe('FormatTaskContext failure memory', () => {
  beforeEach(() => {
    mockTask.outcome = null;
    mockTask.isRunning = false;
    mutateImpl = jest
      .fn()
      .mockResolvedValue({ data: { Node: { format: { error: null } } } });
  });

  it('holds the failure after the toast that announced it is gone', () => {
    const { result, rerender } = renderCtx();
    expect(result.current.lastFailure).toBeNull();

    act(() => {
      mockTask.outcome = { status: 'failed', code: -2 };
      rerender();
    });
    expect(result.current.lastFailure).toBe('format.toast.failedErased');

    // The hook acknowledges the outcome, so it is a one-shot — but the message
    // must survive it: this is what the reopened dialog shows.
    act(() => {
      mockTask.outcome = null;
      rerender();
    });
    expect(result.current.lastFailure).toBe('format.toast.failedErased');
  });

  it('distinguishes an erased disk from an untouched one', () => {
    const { result, rerender } = renderCtx();
    act(() => {
      mockTask.outcome = { status: 'failed', code: -1 };
      rerender();
    });
    expect(result.current.lastFailure).toBe('format.toast.failedUntouched');
  });

  it('clears it when a new format starts', async () => {
    const { result, rerender } = renderCtx();
    act(() => {
      mockTask.outcome = { status: 'failed', code: -2 };
      rerender();
    });
    expect(result.current.lastFailure).toBe('format.toast.failedErased');

    mockTask.outcome = null;
    await act(async () => {
      await result.current.startFormat();
    });
    expect(result.current.lastFailure).toBeNull();
  });

  it('clears it when a run succeeds', () => {
    const { result, rerender } = renderCtx();
    act(() => {
      mockTask.outcome = { status: 'failed', code: -2 };
      rerender();
    });
    act(() => {
      mockTask.outcome = { status: 'success' };
      rerender();
    });
    expect(result.current.lastFailure).toBeNull();
  });
});
