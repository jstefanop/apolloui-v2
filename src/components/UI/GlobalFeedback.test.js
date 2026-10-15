import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import GlobalFeedback from './GlobalFeedback';
import feedbackReducer, {
  sendFeedback,
  resetFeedback,
} from '../../redux/slices/feedbackSlice';

const makeStore = (preloadedState) =>
  configureStore({ reducer: { feedback: feedbackReducer }, preloadedState });

const mount = (store) =>
  renderWithProviders(
    <Provider store={store}>
      <GlobalFeedback />
    </Provider>
  );

describe('GlobalFeedback', () => {
  it('shows a toast with the message when a success is dispatched', async () => {
    const store = makeStore();
    mount(store);
    expect(screen.queryByText('Settings saved.')).not.toBeInTheDocument();

    act(() => {
      store.dispatch(sendFeedback({ message: 'Settings saved.', type: 'success' }));
    });

    expect(await screen.findByText('Settings saved.')).toBeVisible();
  });

  it('shows an error toast', async () => {
    const store = makeStore();
    mount(store);

    act(() => {
      store.dispatch(sendFeedback({ message: 'Duplicate input name', type: 'error' }));
    });

    expect(await screen.findByText('Duplicate input name')).toBeVisible();
  });

  it('does not toast state that was already there on mount', async () => {
    const store = makeStore({
      feedback: { message: 'Stale message', type: 'error', seq: 3 },
    });
    mount(store);

    // Give a wrongly-fired toast time to appear.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(screen.queryByText('Stale message')).not.toBeInTheDocument();

    // ...and the first real dispatch afterwards still works.
    act(() => {
      store.dispatch(sendFeedback({ message: 'Fresh message', type: 'info' }));
    });
    expect(await screen.findByText('Fresh message')).toBeVisible();
  });

  it('shows every message of a synchronous burst, once each', async () => {
    const store = makeStore();
    mount(store);

    act(() => {
      store.dispatch(sendFeedback({ message: 'Restarting miner...', type: 'info' }));
      store.dispatch(sendFeedback({ message: 'Pool failed', type: 'error' }));
      store.dispatch(sendFeedback({ message: 'Pool failed', type: 'error' }));
    });

    expect(await screen.findByText('Restarting miner...')).toBeVisible();
    expect(await screen.findAllByText('Pool failed')).toHaveLength(1);
  });

  it('toasts the same message again after the slice was reset and it was dismissed', async () => {
    const store = makeStore();
    mount(store);

    act(() => {
      store.dispatch(sendFeedback({ message: 'Boom', type: 'error' }));
    });
    await screen.findByText('Boom');

    // A reset alone (the 10 s timer) is not a new message.
    act(() => {
      store.dispatch(resetFeedback());
    });
    expect(screen.getAllByText('Boom')).toHaveLength(1);

    act(() => {
      screen.getByRole('button', { name: 'Close' }).click();
    });
    await waitFor(() => expect(screen.queryByText('Boom')).not.toBeInTheDocument());

    act(() => {
      store.dispatch(sendFeedback({ message: 'Boom', type: 'error' }));
    });
    // Visible once the enter animation has run.
    await waitFor(() => expect(screen.getByText('Boom')).toBeVisible());
  });
});
