import { updateMinerAction } from '../redux/slices/minerActionSlice';
import { sendFeedback } from '../redux/slices/feedbackSlice';
import { reportFailure } from './reportFailure';

// What pressing a start / stop / restart / reboot / shutdown button does to the
// screen.
//
// A service action (miner, node, solo) says NOTHING when it succeeds: the
// progress and the arrival are announced by StatusTransitionFeedback from the
// service status the backend publishes, and a second message of our own for the
// same click was one toast too many ("Stopping Bitcoin node" over "Stopping
// node"). A refusal is the one thing that status never shows, so only that is
// reported here, in the user's language.
//
// Reboot and shutdown take the connection down with them, so their answer can
// never be waited for: they are announced at once.
export const runSystemAction = async ({ dispatch, action, call, title, description }) => {
  const isSystemPower = /Mcu$/.test(action);
  const pending = call?.();

  if (!isSystemPower && reportFailure(dispatch, await pending)) return false;

  dispatch(
    updateMinerAction({
      loading: false,
      error: undefined,
      data: { action, title, description },
      status: action.match(/start/i) ? 'online' : 'offline',
      timestamp: Date.now(),
    })
  );

  if (isSystemPower) {
    dispatch(sendFeedback({ message: `${title} - ${description}`, type: 'success' }));
  }
  return true;
};
