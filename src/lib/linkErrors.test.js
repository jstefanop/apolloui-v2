import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders, screen } from '../test-utils';
import GlobalFeedback from '../components/UI/GlobalFeedback';
import feedbackReducer from '../redux/slices/feedbackSlice';
import { reportLinkErrors } from './linkErrors';

const setup = () => {
  const store = configureStore({ reducer: { feedback: feedbackReducer } });
  renderWithProviders(
    <Provider store={store}>
      <GlobalFeedback />
    </Provider>
  );
  return store;
};

const report = (store, err) =>
  act(() => reportLinkErrors({ operation: { operationName: 'Op' }, ...err }, store.dispatch));

describe('apollo error link reporting', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => console.log.mockRestore());

  it('does not toast a network error', async () => {
    const store = setup();
    report(store, { networkError: new Error('Failed to fetch') });
    report(store, { networkError: new Error('Timeout exceeded') });
    await act(async () => new Promise((r) => setTimeout(r, 100)));
    expect(store.getState().feedback.seq).toBe(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('toasts a GraphQL error with the bare server message', async () => {
    const store = setup();
    report(store, { graphQLErrors: [{ message: 'Duplicate input name' }] });
    expect(await screen.findByText('Duplicate input name')).toBeVisible();
  });

  it('shows each distinct message of one response', async () => {
    const store = setup();
    report(store, { graphQLErrors: [{ message: 'First problem' }, { message: 'Second problem' }] });
    expect(await screen.findByText('First problem')).toBeVisible();
    expect(await screen.findByText('Second problem')).toBeVisible();
  });

  it('shows one toast when two operations fail with the same message', async () => {
    const store = setup();
    report(store, { graphQLErrors: [{ message: 'Same failure' }] });
    report(store, { graphQLErrors: [{ message: 'Same failure' }], operation: { operationName: 'Other' } });
    expect(await screen.findAllByText('Same failure')).toHaveLength(1);
  });

  it('leaves unauthenticated errors to the session flow', async () => {
    const store = setup();
    report(store, {
      graphQLErrors: [
        { message: 'You must be authenticated to access this resource', extensions: { code: 'UNAUTHENTICATED' } },
      ],
    });
    await act(async () => new Promise((r) => setTimeout(r, 100)));
    expect(store.getState().feedback.seq).toBe(0);
  });

  it('hands an unauthenticated error to the session handler with its operation', () => {
    const onUnauthenticated = jest.fn();
    const operation = { operationName: 'GetPools' };
    reportLinkErrors(
      { operation, graphQLErrors: [{ message: 'You must be authenticated', extensions: { code: 'UNAUTHENTICATED' } }] },
      jest.fn(),
      onUnauthenticated
    );
    expect(onUnauthenticated).toHaveBeenCalledWith(operation);
  });

  it('does not toast for an operation whose caller shows the error itself', async () => {
    const store = setup();
    const operation = { operationName: 'SavePools', getContext: () => ({ silentErrors: true }) };
    report(store, { operation, graphQLErrors: [{ message: 'Invalid pool' }] });
    await act(async () => new Promise((r) => setTimeout(r, 100)));
    expect(store.getState().feedback.seq).toBe(0);
  });

  it('does not take a message that merely says "authenticated" for a refused token', async () => {
    const store = setup();
    const onUnauthenticated = jest.fn();
    act(() =>
      reportLinkErrors(
        { operation: { operationName: 'Op' }, graphQLErrors: [{ message: 'Profile not authenticated' }] },
        store.dispatch,
        onUnauthenticated
      )
    );
    expect(onUnauthenticated).not.toHaveBeenCalled();
    expect(await screen.findByText('Profile not authenticated')).toBeVisible();
  });
});
