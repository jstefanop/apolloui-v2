import { useEffect, useState } from 'react'; // Import useState hook
import { useSession } from 'next-auth/react';
import { AUTH_STATUS_QUERY } from '../graphql/auth';
import { GET_POOLS_QUERY } from '../graphql/pools';
import { useLazyQuery } from '@apollo/client';
import { useDeviceType } from '../contexts/DeviceConfigContext';

const ProtectedRoute = ({ router, children }) => {
  const { status, data } = useSession();
  const deviceType = useDeviceType();
  const [prevStatus, setPrevStatus] = useState(null); // Keep track of previous status
  const [poolCheckDone, setPoolCheckDone] = useState(false);

  const [getStatus, { data: setup }] = useLazyQuery(AUTH_STATUS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const [getPools, { data: poolsData }] = useLazyQuery(GET_POOLS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!router.isReady) return;
    getStatus();
  }, [router.pathname, getStatus, router.isReady]);

  // Check for pool configuration when authenticated
  useEffect(() => {
    // Only check pools if user is authenticated and setup is done
    if (status === 'authenticated' && setup) {
      const setupDone = setup?.Auth?.status?.result?.status;
      if (setupDone === 'done' && !poolCheckDone) {
        getPools();
      }
    }
  }, [status, setup, poolCheckDone, getPools]);

  // Handle pool validation and redirect
  useEffect(() => {
    if (!poolsData || poolCheckDone) return;

    const pools = poolsData?.Pool?.list?.result?.pools;
    const hasValidPool = pools && pools.length > 0 && pools[0]?.url && pools[0]?.username;
    
    // If no valid pool and not on setup or settings page, redirect to settings
    if (!hasValidPool && 
        router.pathname !== '/setup' && 
        router.pathname !== '/signin' &&
        !router.pathname.startsWith('/settings')) {
      setPoolCheckDone(true);
      // For solo-node redirect to solo settings (where wallet is configured)
      // For miner redirect to pools settings
      const settingsTab = deviceType === 'solo-node' ? 'solo' : 'pools';
      router.push(`/settings/${settingsTab}`);
    } else {
      // Mark check as done even if pool is invalid but we're on settings page
      setPoolCheckDone(true);
    }
  }, [poolsData, poolCheckDone, router, deviceType]);

  useEffect(() => {
    let setupDone = 'done';
    if (!setup) return;
    setupDone = setup?.Auth?.status?.result?.status;

    // Set Graphql token to localstorage
    if (data?.user?.name) localStorage.setItem('token', data.user.name);

    // Check if status has changed to prevent infinite loop
    if (status !== prevStatus) {
      // Redirect unsetup users
      if (setupDone !== 'done') {
        router.push('/setup');
      }
      // Redirect unauthenticated users
      else if (router.pathname === '/setup' && setupDone === 'done') {
        router.push('/signin');
      }
      else if (router.pathname !== '/setup' && status === 'unauthenticated') {
        router.push('/signin');
      }
      else if (router.pathname === '/signin' && status === 'authenticated') {
        router.push('/overview');
      }

      setPrevStatus(status); // Update prevStatus
    }
  }, [status, data, setup, router, prevStatus]);

  return children;
};

export default ProtectedRoute;
