import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../lib/apolloClient';
import { SessionProvider } from 'next-auth/react';

import '../assets/css/App.css';
import theme from '../theme/theme';

import routes from '../routes';
import wrapper from '../redux/store';
import AuthLayout from '../components/layouts/Auth';
import DefaultLayout from '../components/layouts/Default';
import ProtectedRoutes from '../components/ProtectedRoutes';
import illustration from '../assets/img/auth/auth2.jpg';

import messages_en from '../locales/en.json';
import Error from 'next/error';

function App({ Component, pageProps: { session, ...pageProps }, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const router = useRouter();
  const [asPath, setAsPath] = useState(false);
  const apolloClient = useApollo(pageProps);

  const locales = {
    en: {
      messages: messages_en,
      title: 'English',
      helpPath: 'en-us',
    },
  };

  const locale = router.locale || 'en';
  const defaultLocale = router.defaultLocale;

  useEffect(() => {
    if (router.isReady) setAsPath(router.asPath);
  }, [router]);

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <ApolloProvider client={apolloClient}>
          <Provider store={store}>
            <IntlProvider
              locale={locale}
              defaultLocale={defaultLocale}
              messages={locales[locale].messages}
            >
              <ProtectedRoutes router={router}>
                <AnimatePresence mode='wait' initial={false}>
                  {router.pathname === '/signin' ? (
                    <AuthLayout
                      illustrationBackground={illustration.src}
                      image={illustration.src}
                      asPath={asPath}
                      locales={locales}
                      locale={locale}
                    >
                      <Component {...props.pageProps} />
                    </AuthLayout>
                  ) : router.route === '/404' ? (
                    <Error statusCode={404} />
                  ) : (
                    <DefaultLayout
                      asPath={asPath}
                      locales={locales}
                      locale={locale}
                      routes={routes}
                    >
                      <Component {...props.pageProps} />
                    </DefaultLayout>
                  )}
                </AnimatePresence>
              </ProtectedRoutes>
            </IntlProvider>
          </Provider>
        </ApolloProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default App;
