import { act, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';
import itMessages from '../../locales/it.json';
import { flattenMessages } from '../../lib/utils';
import BackendOfflineScreen from './BackendOfflineScreen';

// The real module opens an HTTP link, which needs fetch.
jest.mock('../../lib/apolloClient', () => ({ getBackendUrl: () => 'http://x/health' }));

it('speaks the chosen language, not English', () => {
  render(
    <ChakraProvider>
      <IntlProvider locale="it" messages={flattenMessages(itMessages)}>
        <BackendOfflineScreen onRetry={() => {}} />
      </IntlProvider>
    </ChakraProvider>
  );
  expect(screen.getByText('Riprova ora')).toBeInTheDocument();
  // Shown once, and once more as the spinner's accessible label.
  expect(screen.getAllByText('Tentativo di riconnessione…')).toHaveLength(2);
  expect(screen.getByText('Risoluzione dei problemi')).toBeInTheDocument();
  expect(screen.queryByText('Retry now')).not.toBeInTheDocument();
  // The spinner's own accessible label, which Chakra defaults to English.
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

describe('the elapsed counter', () => {
  afterEach(() => jest.useRealTimers());

  it('follows the clock when ticks are throttled (a background tab)', () => {
    jest.useFakeTimers();
    render(
      <ChakraProvider>
        <IntlProvider locale="it" messages={flattenMessages(itMessages)}>
          <BackendOfflineScreen onRetry={() => {}} />
        </IntlProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('0s')).toBeInTheDocument();

    // One tick arrives, a minute late: counting ticks would say "1s".
    act(() => {
      jest.setSystemTime(Date.now() + 65000);
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1m 6s')).toBeInTheDocument();
  });
});
