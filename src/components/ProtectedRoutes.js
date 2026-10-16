import { useEffect, useRef, useState } from 'react'; // Import useState hook
import { useSession } from 'next-auth/react';
import { AUTH_STATUS_QUERY } from '../graphql/auth';
import { GET_POOLS_QUERY } from '../graphql/pools';
import { useLazyQuery } from '@apollo/client';
import { useDeviceType } from '../contexts/DeviceConfigContext';

// Waits before each retry of a failed status query (the number of entries is the
// number of retries).
export const STATUS_RETRY_DELAYS_MS = [2000, 5000, 15000, 30000, 60000];

const ProtectedRoute = ({ router, children }) => {
  const { status, data } = useSession();
  const deviceType = useDeviceType();
  const [prevStatus, setPrevStatus] = useState(null); // Keep track of previous status
  const [poolCheckDone, setPoolCheckDone] = useState(false);

  const [getStatus, { data: setup, error: setupError }] = useLazyQuery(AUTH_STATUS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const [getPools, { data: poolsData }] = useLazyQuery(GET_POOLS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!router.isReady) return;
    getStatus();
  }, [router.pathname, getStatus, router.isReady]);

  // A status query that failed is asked again, a bounded number of times and
  // further apart each time: until now it was only asked on navigation, so a
  // visitor who stayed put never got an answer and nothing ever re-aligned. The
  // answer, when it comes, goes through the same (session, setup) evaluation as
  // any other, so it cannot loop: after the last attempt it simply stays failed.
  const statusAttempts = useRef(0);
  // Re-arms the effect after each attempt even if Apollo hands back the very same
  // error object.
  const [retryTick, setRetryTick] = useState(0);
  useEffect(() => {
    if (setup) {
      statusAttempts.current = 0;
      return undefined;
    }
    if (!setupError || statusAttempts.current >= STATUS_RETRY_DELAYS_MS.length) return undefined;
    const timer = setTimeout(() => {
      statusAttempts.current += 1;
      getStatus();
      setRetryTick((n) => n + 1);
    }, STATUS_RETRY_DELAYS_MS[statusAttempts.current]);
    return () => clearTimeout(timer);
  }, [setup, setupError, getStatus, retryTick]);

  // The status query is what every redirect below waits for. When it fails and
  // there is no session, nothing would ever move: Default renders nothing for a
  // signed-out user, and the page stayed blank with no way out. Signed out is
  // the one thing known without it.
  useEffect(() => {
    if (!router.isReady || setup || !setupError || status !== 'unauthenticated') return;
    if (router.pathname === '/signin' || router.pathname === '/setup') return;
    router.push('/signin');
  }, [setup, setupError, status, router]);

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

    // A refused or failed read is not an empty list. Taking it for one sent a
    // signed-in user with a rejected token from /overview to the pools page, to
    // fill in a form for a configuration that was never looked at.
    if (!Array.isArray(pools)) return;
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
    // Wait for both setup data and session status to be ready
    if (!setup || status === 'loading') return;
    
    let setupDone = setup?.Auth?.status?.result?.status;

    // Set Graphql token to localstorage
    if (data?.user?.name) localStorage.setItem('token', data.user.name);

    // What the redirects below depend on: the session AND what the device says
    // about setup. Keyed on the session alone, a status that failed first and
    // answered `pending` on the next try was never looked at again until a reload.
    // Same key, no redirect, so the loop guarantee stays: one evaluation per
    // (session, setup) pair.
    const evaluated = `${status}|${setupDone ?? 'unknown'}`;
    if (evaluated !== prevStatus) {
      // Redirect unsetup users - this should be checked FIRST. Only on the
      // device's own word: a status payload with an error and no result says
      // nothing about setup, and reading "no answer" as "not done" sent an
      // already-configured device to the setup wizard.
      if (setupDone === 'pending') {
        router.push('/setup');
      }
      // Unknown: act on what is known without it. A session that ended goes to
      // sign-in; a live one has a token, which only exists after setup, so it
      // leaves the sign-in page for the app. Everything else stays where it is.
      // These conditions are disjoint by page and session, so they cannot chain
      // into a loop, and the whole block runs once per session status.
      else if (setupDone !== 'done') {
        const onAuthPage = router.pathname === '/signin' || router.pathname === '/setup';
        if (status === 'unauthenticated' && !onAuthPage) router.push('/signin');
        else if (status === 'authenticated' && router.pathname === '/signin') router.push('/overview');
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

      setPrevStatus(evaluated);
    }
  }, [status, data, setup, router, prevStatus]);

  return children;
};

export default ProtectedRoute;
