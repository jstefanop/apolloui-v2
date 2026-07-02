import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';
import theme from './theme/theme';
import en from './locales/en.json';
import { flattenMessages } from './lib/utils';

const messages = flattenMessages(en);

// Wrap a component in the providers the app pages rely on (Chakra + react-intl).
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => (
    <ChakraProvider theme={theme}>
      <IntlProvider locale="en" messages={messages} onError={() => {}}>
        {children}
      </IntlProvider>
    </ChakraProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
