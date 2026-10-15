import { render, screen } from '@testing-library/react';
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
  expect(screen.getByText('Tentativo di riconnessione…')).toBeInTheDocument();
  expect(screen.getByText('Risoluzione dei problemi')).toBeInTheDocument();
  expect(screen.queryByText('Retry now')).not.toBeInTheDocument();
});
