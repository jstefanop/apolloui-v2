import { useEffect, useState } from 'react'; // Import useState hook
import { useSession } from 'next-auth/react';
import { AUTH_STATUS_QUERY } from '../graphql/auth';
import { useLazyQuery } from '@apollo/client';

const ProtectedRoute = ({ router, children }) => {
  const { status, data } = useSession();
  const [prevStatus, setPrevStatus] = useState(null); // Keep track of previous status

  const [getStatus, { data: setup }] = useLazyQuery(AUTH_STATUS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!router.isReady) return;
    getStatus();
  }, [router.pathname, getStatus, router.isReady]);

  useEffect(() => {
    let setupDone = 'done';
    if (!setup) return;
    setupDone = setup?.Auth?.status?.result?.status;

    // Set Graphql token to localstorage
    if (data?.user?.name) localStorage.setItem('token', data.user.name);

    // Check if status has changed to prevent infinite loop
    if (status !== prevStatus) {
      // Redirect unsetup users
      if (setupDone !== 'done') router.push('/setup');
      // Redirect unauthenticated users
      else if (router.pathname === '/setup' && setupDone === 'done')
        router.push('/signin');
      else if (router.pathname !== '/setup' && status === 'unauthenticated')
        router.push('/signin');
      else if (router.pathname === '/signin' && status === 'authenticated')
        router.push('/overview');

      setPrevStatus(status); // Update prevStatus
    }
  }, [status, data, setup, router, prevStatus]); // Include prevStatus in dependencies

  return children;
};

export default ProtectedRoute;
