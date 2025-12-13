import React, { useEffect } from 'react';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import BlockFoundCelebration from '../UI/BlockFoundCelebration';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useQuery } from '@apollo/client';
import { updateNodeStats } from '../../redux/slices/nodeSlice';
import { NODE_STATS_QUERY } from '../../graphql/node';
import { MINER_STATS_QUERY } from '../../graphql/miner';
import { updateMinerStats } from '../../redux/slices/minerSlice';
import { SOLO_STATS_QUERY } from '../../graphql/solo';
import { updateSoloStats } from '../../redux/slices/soloSlice';
import { MCU_STATS_QUERY } from '../../graphql/mcu';
import { updateMcuStats } from '../../redux/slices/mcuSlice';
import { GET_SETTINGS_QUERY } from '../../graphql/settings';
import { updateSettings } from '../../redux/slices/settingsSlice';
import { settingsSelector } from '../../redux/reselect/settings';
import { SERVICES_STATUS_QUERY } from '../../graphql/services';
import { updateServicesStatus } from '../../redux/slices/servicesSlice';
import { minerSelector } from '../../redux/reselect/miner';
import { isAuthError } from '../../redux/utils/errorUtils';
import { useDeviceType } from '../../contexts/DeviceConfigContext';
import { getRoutes } from '../../routes';

const createSerializableError = (error) => {
  if (!error) return null;
  
  return {
    message: error.message || 'Unknown error',
    operationName: error.operation?.operationName || 'Unknown operation',
    timestamp: new Date().toISOString()
  };
};

const Layout = ({ children }) => {
  const { onOpen } = useDisclosure();
  const dispatch = useDispatch();
  const minerPollingTime = process.env.NEXT_PUBLIC_POLLING_TIME;
  const nodePollingTime = process.env.NEXT_PUBLIC_POLLING_TIME_NODE;
  const deviceType = useDeviceType();
  
  // Generate routes dynamically based on device type
  // Fallback to 'miner' if deviceType is not yet loaded
  const dynamicRoutes = getRoutes(deviceType || 'miner');
  let routes = dynamicRoutes;

  // Miner data - only fetch if not solo-node device
  const {
    loading: loadingMiner,
    error: errorMiner,
    data: dataMiner,
    startPolling: startPollingMiner,
    stopPolling: stopPollingMiner,
  } = useQuery(MINER_STATS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: typeof window === 'undefined' || !deviceType || deviceType === 'solo-node'
  });

  useEffect(() => {
    // Skip miner polling and data processing for solo-node devices
    if (!deviceType || deviceType === 'solo-node') {
      return;
    }

    startPollingMiner(minerPollingTime);

    // Create a serializable error object
    const serializableError = createSerializableError(errorMiner);

    // Prepare the data if available
    const safeData = dataMiner ? {
      ...dataMiner,
      Miner: dataMiner.Miner ? {
        ...dataMiner.Miner,
        stats: dataMiner.Miner.stats ? {
          ...dataMiner.Miner.stats,
          result: dataMiner.Miner.stats.result ? {
            ...dataMiner.Miner.stats.result,
            stats: dataMiner.Miner.stats.result.stats
          } : null
        } : null
      } : null
    } : null;

    // Single dispatch with current state
    dispatch(
      updateMinerStats({
        loading: loadingMiner,
        error: serializableError,
        data: safeData,
      })
    );

    return () => {
      stopPollingMiner(); // Stop polling
    };
  }, [
    startPollingMiner,
    dispatch,
    loadingMiner,
    errorMiner,
    dataMiner,
    minerPollingTime,
    stopPollingMiner,
    deviceType
  ]);

  // Solo data
  const {
    loading: loadingSolo,
    error: errorSolo,
    data: dataSolo,
    startPolling: startPollingSolo,
    stopPolling: stopPollingSolo,
  } = useQuery(SOLO_STATS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: typeof window === 'undefined'
  });

  useEffect(() => {
    startPollingSolo(minerPollingTime);

    // Create a serializable error object
    const serializableError = createSerializableError(errorSolo);

    // Single dispatch with current state
    dispatch(
      updateSoloStats({
        loading: loadingSolo,
        error: serializableError,
        data: dataSolo,
      })
    );

    return () => {
      stopPollingSolo(); // Stop polling
    };
  }, [
    startPollingSolo,
    dispatch,
    loadingSolo,
    errorSolo,
    dataSolo,
    minerPollingTime,
    stopPollingSolo
  ]);

  // Mcu data
  const {
    loading: loadingMcu,
    error: errorMcu,
    data: dataMcu,
    startPolling: startPollingMcu,
    stopPolling: stopPollingMcu,
  } = useQuery(MCU_STATS_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: typeof window === 'undefined'
  });

  useEffect(() => {
    startPollingMcu(minerPollingTime);
    
    // Only dispatch if we have data or if the error is not an authentication error
    if (dataMcu || (errorMcu && !isAuthError(errorMcu))) {
      // Create a serializable error object
      const serializableError = createSerializableError(errorMcu);
      
      dispatch(
        updateMcuStats({
          loading: loadingMcu,
          error: serializableError,
          data: dataMcu,
        })
      );
    }

    return () => {
      stopPollingMcu(); // Stop polling
    };
  }, [
    startPollingMcu,
    dispatch,
    loadingMcu,
    errorMcu,
    dataMcu,
    minerPollingTime,
    stopPollingMcu
  ]);

  // Node data
  const {
    loading: loadingNode,
    error: errorNode,
    data: dataNode,
    startPolling: startPollingNode,
    stopPolling: stopPollingNode,
  } = useQuery(NODE_STATS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: typeof window === 'undefined'
  });

  useEffect(() => {
    startPollingNode(nodePollingTime);
    
    // Only dispatch if we have data or if the error is not an authentication error
    if (dataNode || (errorNode && !isAuthError(errorNode))) {
      // Create a serializable error object
      const serializableError = createSerializableError(errorNode);
      
      dispatch(
        updateNodeStats({
          loading: loadingNode,
          error: serializableError,
          data: dataNode,
        })
      );
    }

    return () => {
      stopPollingNode(); // Stop polling
    };
  }, [
    startPollingNode,
    dispatch,
    loadingNode,
    errorNode,
    dataNode,
    nodePollingTime,
    stopPollingNode
  ]);

  // Settings data
  const {
    loading: loadingSettings,
    error: errorSettings,
    data: dataSettings,
    startPolling: startPollingSettings,
    stopPolling: stopPollingSettings,
  } = useQuery(GET_SETTINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: typeof window === 'undefined'
  });

  useEffect(() => {
    startPollingSettings(minerPollingTime);
    
    // Only dispatch if we have data or if the error is not an authentication error
    if (dataSettings || (errorSettings && !isAuthError(errorSettings))) {
      // Create a serializable error object
      const serializableError = createSerializableError(errorSettings);
      
      dispatch(
        updateSettings({
          loading: loadingSettings,
          error: serializableError,
          data: dataSettings,
        })
      );
    }

    return () => {
      stopPollingSettings(); // Stop polling
    };
  }, [
    startPollingSettings,
    dispatch,
    loadingSettings,
    errorSettings,
    dataSettings,
    minerPollingTime,
    stopPollingSettings
  ]);

  // Services data
  const {
    loading: loadingServices,
    error: errorServices,
    data: dataServices,
    startPolling: startPollingServices,
    stopPolling: stopPollingServices,
  } = useQuery(SERVICES_STATUS_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: typeof window === 'undefined'
  });

  useEffect(() => {
    startPollingServices(2000);
    
    // Only dispatch if we have data or if the error is not an authentication error
    if (dataServices || (errorServices && !isAuthError(errorServices))) {
      // Create a serializable error object
      const serializableError = createSerializableError(errorServices);
      
      dispatch(
        updateServicesStatus({
          loading: loadingServices,
          error: serializableError,
          data: dataServices,
        })
      );
    }

    return () => {
      stopPollingServices(); // Stop polling
    };
  }, [
    startPollingServices,
    dispatch,
    loadingServices,
    errorServices,
    dataServices,
    stopPollingServices
  ]);

  // Settings data reselected
  const {
    data: { nodeEnableSoloMining },
  } = useSelector(settingsSelector, shallowEqual);

  // Get block found status from minerData
  const {
    data: {
      stats: { blockFound },
    },
  } = useSelector(minerSelector, shallowEqual);

  // Reparsing routes
  routes = routes.filter((route) => {
    // Show solo-mining route if device is solo-node OR if nodeEnableSoloMining is enabled
    if (route.path === '/solo-mining' && deviceType !== 'solo-node' && !nodeEnableSoloMining) return false;
    return true;
  });

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
          w={{ base: '100%', xl: 'calc( 100% - 190px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 190px )' }}
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

          {/* Block Found Celebration */}
          {blockFound && (
            <Box
              mx="auto"
              px={{ base: '20px', md: '30px' }}
              pt={{ base: '150px', md: '70px' }}
            >
              <BlockFoundCelebration blockFound={blockFound} />
            </Box>
          )}

          <Box
            mx="auto"
            p={{ base: '20px', md: '30px' }}
            pe="20px"
            minH="90vh"
            pt="50px"
          >
            <Box pt={!blockFound && { base: '130px', md: '80px', xl: '80px' }}>
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
