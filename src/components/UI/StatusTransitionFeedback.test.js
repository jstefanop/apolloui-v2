import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders, screen } from '../../test-utils';
import StatusTransitionFeedback from './StatusTransitionFeedback';
import feedbackReducer, { sendFeedback } from '../../redux/slices/feedbackSlice';

const online = { miner: { status: 'online', requestedStatus: 'online' } };
const starting = { miner: { status: 'pending', requestedStatus: 'online' } };

const mount = (store) => {
  const ui = (status) => (
    <Provider store={store}>
      <StatusTransitionFeedback serviceStatus={status} type="miner" />
    </Provider>
  );
  const view = renderWithProviders(ui(online));
  return { view, ui };
};

const transition = async (view, ui) => {
  // The component only announces a change from a status it has already seen.
  await act(async () => {
    view.rerender(ui(starting));
  });
};

describe('StatusTransitionFeedback', () => {
  it('announces a transition the backend started', async () => {
    const store = configureStore({ reducer: { feedback: feedbackReducer } });
    const { view, ui } = mount(store);
    await transition(view, ui);
    expect(await screen.findByText('Starting miner')).toBeInTheDocument();
  });

  it('does not announce one right after a restart was reported as failed', async () => {
    const store = configureStore({ reducer: { feedback: feedbackReducer } });
    const { view, ui } = mount(store);
    act(() => {
      store.dispatch(sendFeedback({ message: 'Restart refused', type: 'error', tag: 'restart-failed' }));
    });
    await transition(view, ui);
    await act(async () => new Promise((r) => setTimeout(r, 100)));
    expect(screen.queryByText('Starting miner')).not.toBeInTheDocument();
  });
});
