import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../lib/apolloClient';
import { SessionProvider } from 'next-auth/react';
import { setMomentLocale } from '../lib/moment';

import '../assets/css/App.css';
import 'animate.css';
import theme from '../theme/theme';

import wrapper from '../redux/store';
import AuthLayout from '../components/layouts/Auth';
import DefaultLayout from '../components/layouts/Default';
import ProtectedRoutes from '../components/ProtectedRoutes';
import illustration from '../assets/img/networking_banner.png';
import { flattenMessages } from '../lib/utils';
import { DeviceConfigProvider } from '../contexts/DeviceConfigContext';

import messages_en from '../locales/en.json';
import messages_it from '../locales/it.json';
import messages_de from '../locales/de.json';
import messages_es from '../locales/es.json';
import Error from 'next/error';

function App({ Component, pageProps: { session, ...pageProps }, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const router = useRouter();
  const [asPath, setAsPath] = useState(false);
  const apolloClient = useApollo(pageProps);

  const locales = {
    en: {
      messages: flattenMessages(messages_en),
      title: 'English',
      helpPath: 'en-us',
    },
    it: {
      messages: flattenMessages(messages_it),
      title: 'Italiano',
      helpPath: 'it-it',
    },
    de: {
      messages: flattenMessages(messages_de),
      title: 'Deutsch',
      helpPath: 'de-de',
    },
    es: {
      messages: flattenMessages(messages_es),
      title: 'Español',
      helpPath: 'es-es',
    },
  };

  const locale = router.locale || 'en';
  const defaultLocale = router.defaultLocale;

  // Ensure messages are loaded
  const messages = locales[locale]?.messages || {};

  useEffect(() => {
    if (router.isReady) setAsPath(router.asPath);
  }, [router]);

  // Set moment.js locale when app locale changes
  useEffect(() => {
    setMomentLocale(locale);
  }, [locale]);

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <ApolloProvider client={apolloClient}>
          <Provider store={store}>
            <IntlProvider
              locale={locale}
              defaultLocale={defaultLocale}
              messages={messages}
              onError={(err) => {
                if (err.code === 'MISSING_TRANSLATION') {
                  console.warn('Missing translation:', err.message);
                  return;
                }
                throw err;
              }}
            >
              <DeviceConfigProvider>
                <ProtectedRoutes router={router}>
                  <AnimatePresence mode='wait' initial={false}>
                    {(router.pathname === '/signin' || router.pathname === '/setup') ? (
                      <AuthLayout
                        illustrationBackground={illustration.src}
                        image={illustration.src}
                        asPath={asPath}
                      >
                        <Component {...pageProps} />
                      </AuthLayout>
                    ) : router.route === '/404' ? (
                      <Error statusCode={404} />
                    ) : (
                      <DefaultLayout
                        asPath={asPath}
                      >
                        <Component {...pageProps} />
                      </DefaultLayout>
                    )}
                  </AnimatePresence>
                </ProtectedRoutes>
              </DeviceConfigProvider>
            </IntlProvider>
          </Provider>
        </ApolloProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default App;
