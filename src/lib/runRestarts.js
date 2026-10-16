import { callFailure, serviceFailureIdOf } from './callFailure';
import { sendFeedback } from '../redux/slices/feedbackSlice';

// The restarts a Settings save asks for, in order, stopping at the first that
// is refused. Says nothing for a restart that was accepted: its progress and its
// arrival are announced by StatusTransitionFeedback from the service status, and
// a "Restarting ..." of our own on top of "Starting ..." is the same news twice.
// A refused one is reported (in the user's language when the backend says which
// service action it was), since the status never shows that.
//
// Returns true when every restart that was asked for went through.
export const runRestarts = async ({ type, deviceType, restartMiner, restartSolo, restartNode, dispatch }) => {
  const attempt = async (run) => {
    const result = await run();
    const failure = callFailure(result);
    if (!failure) return true;
    dispatch(sendFeedback({ message: failure, messageId: serviceFailureIdOf(result), type: 'error' }));
    return false;
  };

  if (type === 'miner') return attempt(restartMiner);
  if (type === 'solo') return attempt(restartSolo);
  if (type === 'node') return attempt(restartNode);
  if (type === 'both') {
    // For solo-node, the solo service and the node; for a miner, the miner.
    const first = await attempt(deviceType === 'solo-node' ? restartSolo : restartMiner);
    return first && (await attempt(restartNode));
  }
  return true;
};
