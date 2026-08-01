import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { NODE_FORMAT_MUTATION, NODE_FORMAT_PROGRESS_QUERY } from '../graphql/node';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { sendFeedback } from '../redux/slices/feedbackSlice';

// Single owner of the node-format lifecycle, mounted once above both the navbar
// and the page content. Before this, the modal on the Settings page owned its own
// useTaskProgress instance, so hiding it and navigating away unmounted the watcher
// — and the completion toast was lost. Here the watcher lives at layout level: the
// navbar shows a persistent progress indicator, the completion feedback always
// fires, and the modal is just a view onto this state, opened from either place.

const FormatTaskContext = createContext(null);

// How long the navbar keeps showing the success/failure result after a format ends
// before the indicator fades out.
const RESULT_LINGER_MS = 10000;

export const FormatTaskProvider = ({ children }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const { progress, isRunning, outcome, acknowledgeOutcome, markSubmitted, clearSubmitted } =
    useTaskProgress(
      NODE_FORMAT_PROGRESS_QUERY,
      (data) => data?.Node?.formatProgress?.result?.value
    );

  const [formatDisk] = useMutation(NODE_FORMAT_MUTATION);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The last finished outcome, kept briefly so the navbar can show ✓/✗ after the
  // run ends and then fade. Separate from `outcome` (a one-shot the effect below
  // consumes immediately to fire the toast).
  const [result, setResult] = useState(null); // 'success' | 'failed' | null
  const resultTimer = useRef(null);

  // The last failure, held until a new format starts. A toast is the only place
  // this was ever said, and it is gone in seconds — on another page, or with the
  // dialog hidden, nobody sees it. Reopening the dialog then shows the plain
  // confirmation, as if nothing had happened. That is worst for code -2, where
  // the disk is already erased and the node will not start until a format
  // succeeds: without the message there is nothing to explain why it is down.
  const [lastFailure, setLastFailure] = useState(null);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Kick off the format. Latch before the next poll can answer — this wipes a disk
  // and pressing twice would launch two at once. The resolver reports refusals
  // inside data (data.Node.format.error) and the mutation rejects on GraphQL
  // errors, so check both; a launch the backend refused drops the latch so the
  // dialog returns to the confirmation view instead of a stuck "Formatting…".
  const startFormat = useCallback(async () => {
    markSubmitted();
    setLastFailure(null); // this run's outcome replaces the previous one
    try {
      const { data, errors } = await formatDisk();
      const formatError = data?.Node?.format?.error;
      if (errors?.length || formatError) {
        throw new Error(
          formatError?.message ||
            errors?.[0]?.message ||
            intl.formatMessage({ id: 'format.toast.startFailed' })
        );
      }
      dispatch(
        sendFeedback({
          message: intl.formatMessage({ id: 'format.toast.started' }),
          type: 'info',
        })
      );
    } catch (error) {
      // Unlatch only when the backend ANSWERED that nothing launched (a GraphQL
      // or resolver error). A transport failure leaves the launch unknown — the
      // worker may be running with the response lost — so the latch stays: the
      // submitted grace keeps polling at the active rate and picks such a run
      // up, where unlatching would drop to the idle interval, wide enough to
      // miss an entire format and invite a second wipe.
      if (!error.networkError) clearSubmitted();
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  }, [markSubmitted, clearSubmitted, formatDisk, dispatch, intl]);

  // Report the outcome once, from here rather than the modal, so it lands even if
  // the user hid the dialog and navigated away. Success closes the modal; a failure
  // leaves it open (the disk is not ready). Then linger the result for the navbar.
  useEffect(() => {
    if (!outcome) return;
    acknowledgeOutcome();

    if (outcome.status === 'success') {
      setIsModalOpen(false);
      setLastFailure(null);
      dispatch(
        sendFeedback({
          message: intl.formatMessage({ id: 'format.toast.success' }),
          type: 'success',
        })
      );
    } else {
      // -2 = wiped, -1 = untouched, no code = vanished before 100 (cannot say
      // which), so do not claim the disk is intact.
      const messageId =
        outcome.code === -2
          ? 'format.toast.failedErased'
          : outcome.code === -1
            ? 'format.toast.failedUntouched'
            : 'format.toast.incomplete';
      const message = intl.formatMessage({ id: messageId });
      setLastFailure(message);
      dispatch(sendFeedback({ message, type: 'error' }));
    }

    setResult(outcome.status);
    if (resultTimer.current) clearTimeout(resultTimer.current);
    resultTimer.current = setTimeout(() => setResult(null), RESULT_LINGER_MS);
  }, [outcome, acknowledgeOutcome, dispatch, intl]);

  // A new run cancels a lingering previous result.
  useEffect(() => {
    if (isRunning && resultTimer.current) {
      clearTimeout(resultTimer.current);
      resultTimer.current = null;
      setResult(null);
    }
  }, [isRunning]);

  useEffect(() => () => clearTimeout(resultTimer.current), []);

  // 'running' while a format is under way, then 'success'/'failed' for the linger
  // window, then 'idle'. The navbar shows the indicator for anything but 'idle'.
  const status = isRunning ? 'running' : result || 'idle';

  // The provider re-renders on every poll answer (the hook observes each cycle);
  // memoized, those renders reach consumers — navbar subtree, modal, settings
  // actions — only when something they can show actually changed.
  const value = useMemo(
    () => ({
      progress,
      isRunning,
      status,
      lastFailure,
      isModalOpen,
      openModal,
      closeModal,
      startFormat,
    }),
    [progress, isRunning, status, lastFailure, isModalOpen, openModal, closeModal, startFormat]
  );

  return (
    <FormatTaskContext.Provider value={value}>
      {children}
    </FormatTaskContext.Provider>
  );
};

export const useFormatTask = () => {
  const ctx = useContext(FormatTaskContext);
  if (!ctx) {
    throw new Error('useFormatTask must be used within a FormatTaskProvider');
  }
  return ctx;
};
