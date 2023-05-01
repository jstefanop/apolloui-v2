import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AUTH_STATUS_QUERY } from '../graphql/auth';
import { useLazyQuery } from '@apollo/client';

const ProtectedRoute = ({ router, children }) => {
  const { status, data } = useSession();

  const [getStatus, { data: setup }] = useLazyQuery(AUTH_STATUS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!router.isReady) return;
    getStatus();
  }, [router.pathname, getStatus, router.isReady]);

  useEffect(() => {
    let setupDone = 'done';

    if (setup) setupDone = setup?.Auth?.status?.result?.status;

    // Set Graphql token to localstorage
    if (data?.user?.name) localStorage.setItem('token', data.user.name);

    // Redirect unsetup users
    if (setupDone !== 'done') router.replace('/setup');
    // Redirect unauthenticated users
    else if (router.pathname === '/setup' && setupDone === 'done')
      router.replace('/signin');
    else if (router.pathname !== '/setup' && status === 'unauthenticated')
      router.replace('/signin');
    else if (router.pathname === '/signin' && status === 'authenticated')
      router.replace('/overview');
  }, [status, data, setup, router]);

  return children;
};

export default ProtectedRoute;
