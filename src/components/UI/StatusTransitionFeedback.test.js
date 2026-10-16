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

  it('says nothing when a refused restart left the service where it was', async () => {
    // The backend puts the row back and publishes that, never a pending state.
    const store = configureStore({ reducer: { feedback: feedbackReducer } });
    const { view, ui } = mount(store);
    act(() => {
      store.dispatch(sendFeedback({ message: 'Restart refused', type: 'error' }));
    });
    await act(async () => {
      view.rerender(ui({ miner: { status: 'online', requested_status: 'online', requestedStatus: 'online' } }));
    });
    await act(async () => new Promise((r) => setTimeout(r, 100)));
    expect(screen.queryByText('Starting miner')).not.toBeInTheDocument();
  });

  it('still announces an unrelated service that really starts, after an error', async () => {
    // An error toast must not swallow a genuine transition (it used to, for ten seconds).
    const store = configureStore({ reducer: { feedback: feedbackReducer } });
    const { view, ui } = mount(store);
    act(() => {
      store.dispatch(sendFeedback({ message: 'Something else failed', type: 'error' }));
    });
    await transition(view, ui);
    expect(await screen.findByText('Starting miner')).toBeInTheDocument();
  });
});
