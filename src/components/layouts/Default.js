import React, { useEffect } from 'react';
import {
  Portal,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useQuery } from '@apollo/client';
import { updateNodeStats } from '../../redux/actions/node';
import { NODE_STATS_QUERY } from '../../graphql/node';
import { MINER_STATS_QUERY } from '../../graphql/miner';
import { updateMinerStats } from '../../redux/actions/miner';
import { MCU_STATS_QUERY } from '../../graphql/mcu';
import { updateMcuStats } from '../../redux/actions/mcu';
import { GET_SETTINGS_QUERY } from '../../graphql/settings';
import { updateSettings } from '../../redux/actions/settings';
import { GET_ANALYTICS_QUERY } from '../../graphql/analytics';
import { updateAnalytics } from '../../redux/actions/analytics';
import { settingsSelector } from '../../redux/reselect/settings';
import { SERVICES_STATUS_QUERY } from '../../graphql/services';
import { updateServicesStatus } from '../../redux/actions/services';

const Layout = ({ children, routes }) => {
  const { onOpen } = useDisclosure();
  const dispatch = useDispatch();
  const minerPollingTime = process.env.NEXT_PUBLIC_POLLING_TIME;
  const nodePollingTime = process.env.NEXT_PUBLIC_POLLING_TIME_NODE;

  // Miner data
  const {
    loading: loadingMiner,
    error: errorMiner,
    data: dataMiner,
    startPolling: startPollingMiner,
  } = useQuery(MINER_STATS_QUERY);

  useEffect(() => {
    startPollingMiner(minerPollingTime);
    dispatch(
      updateMinerStats({
        loading: loadingMiner,
        error: errorMiner,
        data: dataMiner,
      })
    );
  }, [
    startPollingMiner,
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
  } = useQuery(MCU_STATS_QUERY);

  useEffect(() => {
    startPollingMcu(minerPollingTime);
    dispatch(
      updateMcuStats({
        loading: loadingMcu,
        error: errorMcu,
        data: dataMcu,
      })
    );
  }, [
    startPollingMcu,
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
  } = useQuery(NODE_STATS_QUERY);

  useEffect(() => {
    startPollingNode(nodePollingTime);
    dispatch(
      updateNodeStats({
        loading: loadingNode,
        error: errorNode,
        data: dataNode,
      })
    );
  }, [
    startPollingNode,
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
  } = useQuery(GET_SETTINGS_QUERY);

  useEffect(() => {
    startPollingSettings(minerPollingTime);
    dispatch(
      updateSettings({
        loading: loadingSettings,
        error: errorSettings,
        data: dataSettings,
      })
    );
  }, [
    startPollingSettings,
    dispatch,
    loadingSettings,
    errorSettings,
    dataSettings,
    minerPollingTime,
  ]);

  // Analytics data
  const {
    loading: loadingAnalytics,
    error: errorAnalytics,
    data: dataAnalytics,
    startPolling: startPollingAnalytics,
  } = useQuery(GET_ANALYTICS_QUERY, {
    variables: {
      input: { interval: 'hour' },
    },
  });

  useEffect(() => {
    startPollingAnalytics(nodePollingTime);
    dispatch(
      updateAnalytics({
        loading: loadingAnalytics,
        error: errorAnalytics,
        data: dataAnalytics,
      })
    );
  }, [
    startPollingAnalytics,
    dispatch,
    loadingAnalytics,
    errorAnalytics,
    dataAnalytics,
    nodePollingTime,
  ]);

  // Services data
  const {
    loading: loadingServices,
    error: errorServices,
    data: dataServices,
    startPolling: startPollingServices,
  } = useQuery(SERVICES_STATUS_QUERY);

  useEffect(() => {
    startPollingServices(2000);
    dispatch(
      updateServicesStatus({
        loading: loadingServices,
        error: errorServices,
        data: dataServices,
      })
    );
  }, [
    startPollingServices,
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
