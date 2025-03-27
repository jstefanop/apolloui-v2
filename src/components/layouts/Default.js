import React, { useEffect, useRef } from 'react';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useQuery } from '@apollo/client';
import { updateNodeStats } from '../../redux/slices/nodeSlice';
import { NODE_STATS_QUERY } from '../../graphql/node';
import { MINER_STATS_QUERY } from '../../graphql/miner';
import { updateMinerStats } from '../../redux/slices/minerSlice';
import { MCU_STATS_QUERY } from '../../graphql/mcu';
import { updateMcuStats } from '../../redux/slices/mcuSlice';
import { GET_SETTINGS_QUERY } from '../../graphql/settings';
import { updateSettings } from '../../redux/slices/settingsSlice';
import { GET_ANALYTICS_QUERY } from '../../graphql/analytics';
import { updateAnalytics, clearAnalyticsData } from '../../redux/slices/analyticsSlice';
import { settingsSelector } from '../../redux/reselect/settings';
import { SERVICES_STATUS_QUERY } from '../../graphql/services';
import { updateServicesStatus } from '../../redux/slices/servicesSlice';

const Layout = ({ children, routes }) => {
  const { onOpen } = useDisclosure();
  const dispatch = useDispatch();
  const router = useRouter();
  const minerPollingTime = process.env.NEXT_PUBLIC_POLLING_TIME;
  const nodePollingTime = process.env.NEXT_PUBLIC_POLLING_TIME_NODE;

  // Reference to store the last analytics poll time
  const lastAnalyticsPollRef = useRef(null);
  // Reference to track if component is mounted
  const isMountedRef = useRef(true);

  // Miner data
  const {
    loading: loadingMiner,
    error: errorMiner,
    data: dataMiner,
    startPolling: startPollingMiner,
    stopPolling: stopPollingMiner,
  } = useQuery(MINER_STATS_QUERY);

  useEffect(() => {
    startPollingMiner(minerPollingTime);

    // Ensure we're only dispatching when we have data and it's changed
    if (dataMiner && isMountedRef.current) {
      // Create a deep copy to avoid direct reference to Apollo cache objects
      const safeData = JSON.parse(JSON.stringify(dataMiner));

      dispatch(
        updateMinerStats({
          loading: loadingMiner,
          error: errorMiner,
          data: safeData,
        })
      );
    }

    return () => {
      stopPollingMiner();
    };
  }, [
    startPollingMiner,
    stopPollingMiner,
    dispatch,
    loadingMiner,
    errorMiner,
    dataMiner,
    minerPollingTime,
  ]);

  // Mcu data
  const {
    loading: loadingMcu,
    error: errorMcu,
    data: dataMcu,
    startPolling: startPollingMcu,
    stopPolling: stopPollingMcu,
  } = useQuery(MCU_STATS_QUERY);

  useEffect(() => {
    startPollingMcu(minerPollingTime);

    if (isMountedRef.current) {
      dispatch(
        updateMcuStats({
          loading: loadingMcu,
          error: errorMcu,
          data: dataMcu,
        })
      );
    }

    return () => {
      stopPollingMcu();
    };
  }, [
    startPollingMcu,
    stopPollingMcu,
    dispatch,
    loadingMcu,
    errorMcu,
    dataMcu,
    minerPollingTime,
  ]);

  // Node data
  const {
    loading: loadingNode,
    error: errorNode,
    data: dataNode,
    startPolling: startPollingNode,
    stopPolling: stopPollingNode,
  } = useQuery(NODE_STATS_QUERY);

  useEffect(() => {
    startPollingNode(nodePollingTime);

    if (isMountedRef.current) {
      dispatch(
        updateNodeStats({
          loading: loadingNode,
          error: errorNode,
          data: dataNode,
        })
      );
    }

    return () => {
      stopPollingNode();
    };
  }, [
    startPollingNode,
    stopPollingNode,
    dispatch,
    loadingNode,
    errorNode,
    dataNode,
    nodePollingTime,
  ]);

  // Settings data
  const {
    loading: loadingSettings,
    error: errorSettings,
    data: dataSettings,
    startPolling: startPollingSettings,
    stopPolling: stopPollingSettings,
  } = useQuery(GET_SETTINGS_QUERY);

  useEffect(() => {
    startPollingSettings(minerPollingTime);

    if (isMountedRef.current) {
      dispatch(
        updateSettings({
          loading: loadingSettings,
          error: errorSettings,
          data: dataSettings,
        })
      );
    }

    return () => {
      stopPollingSettings();
    };
  }, [
    startPollingSettings,
    stopPollingSettings,
    dispatch,
    loadingSettings,
    errorSettings,
    dataSettings,
    minerPollingTime,
  ]);

  // Analytics data with optimized polling
  const {
    loading: loadingAnalytics,
    error: errorAnalytics,
    data: dataAnalytics,
    startPolling: startPollingAnalytics,
    stopPolling: stopPollingAnalytics,
  } = useQuery(GET_ANALYTICS_QUERY, {
    variables: {
      input: { interval: 'hour' },
    },
    fetchPolicy: 'network-only', // Don't use the cache for this query
    notifyOnNetworkStatusChange: true,
  });

  // Optimize analytics polling to prevent memory issues
  useEffect(() => {
    const isOverviewPage = router.pathname === '/overview';

    // Immediately fetch analytics when navigating to overview
    if (isOverviewPage) {
      const now = Date.now();
      const shouldRefresh = !lastAnalyticsPollRef.current ||
        (now - lastAnalyticsPollRef.current) > 30000;

      // Always fetch on first load of overview page
      if (!lastAnalyticsPollRef.current || shouldRefresh) {
        startPollingAnalytics(nodePollingTime);
        lastAnalyticsPollRef.current = now;
      }

      // Always dispatch updates when we have data and component is mounted
      if (dataAnalytics && isMountedRef.current) {
        dispatch(
          updateAnalytics({
            loading: loadingAnalytics,
            error: errorAnalytics,
            data: dataAnalytics,
          })
        );
      }
    } else {
      // If we're not on the overview page, stop polling to save resources
      stopPollingAnalytics();
    }

    return () => {
      // Clean up polling when the effect is re-run or component unmounts
      if (!isOverviewPage) {
        stopPollingAnalytics();
      }
    };
  }, [
    router.pathname,
    startPollingAnalytics,
    stopPollingAnalytics,
    dispatch,
    loadingAnalytics,
    errorAnalytics,
    dataAnalytics,
    nodePollingTime,
  ]);

  // Clean up analytics data when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopPollingAnalytics();
      // Clear analytics data from Redux to prevent memory leaks
      dispatch(clearAnalyticsData());
    };
  }, [stopPollingAnalytics, dispatch]);

  // Services data
  const {
    loading: loadingServices,
    error: errorServices,
    data: dataServices,
    startPolling: startPollingServices,
    stopPolling: stopPollingServices,
  } = useQuery(SERVICES_STATUS_QUERY);

  useEffect(() => {
    startPollingServices(2000);

    if (isMountedRef.current) {
      dispatch(
        updateServicesStatus({
          loading: loadingServices,
          error: errorServices,
          data: dataServices,
        })
      );
    }

    return () => {
      stopPollingServices();
    };
  }, [
    startPollingServices,
    stopPollingServices,
    dispatch,
    loadingServices,
    errorServices,
    dataServices,
  ]);

  // Settings data reselected
  const {
    data: { nodeEnableSoloMining },
  } = useSelector(settingsSelector, shallowEqual);

  // Reparsing routes
  routes = routes.filter((route) => {
    if (route.name === 'SOLO Mining' && !nodeEnableSoloMining) return false;
    return true;
  });

  // Add a cleanup for all polling on route change
  useEffect(() => {
    const handleRouteChange = () => {
      // Update the mounted ref on route change
      isMountedRef.current = false;
    };

    // Listen for route changes
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      isMountedRef.current = false;
    };
  }, [router]);

  const { status } = useSession();
  if (status === 'loading' || status === 'unauthenticated') return <></>;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <Box>
        <Sidebar routes={routes} display="none" />
        <Box
          float="right"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 240px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 240px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                secondary={true}
                fixed={true}
                routes={routes}
              />
            </Box>
          </Portal>
          <Box
            mx="auto"
            p={{ base: '20px', md: '30px' }}
            pe="20px"
            minH="90vh"
            pt="50px"
          >
            <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
              {React.cloneElement(children)}
            </Box>
          </Box>
          <Box>
            <Footer />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Layout;