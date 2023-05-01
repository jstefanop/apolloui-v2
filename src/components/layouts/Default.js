import React, { useEffect } from 'react';
import {
  Portal,
  Box,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { updateNodeStats } from '../../redux/actions/node';
import { NODE_STATS_QUERY } from '../../graphql/node';
import { MINER_STATS_QUERY } from '../../graphql/miner';
import { updateMinerStats } from '../../redux/actions/miner';
import { MCU_STATS_QUERY } from '../../graphql/mcu';
import { updateMcuStats } from '../../redux/actions/mcu';
import { GET_SETTINGS_QUERY } from '../../graphql/settings';
import { updateSettings } from '../../redux/actions/settings';

const Layout = ({ children, routes }, props) => {
  const { onOpen } = useDisclosure();
  const dispatch = useDispatch();

  // Miner data
  const {
    loading: loadingMiner,
    error: errorMiner,
    data: dataMiner,
    startPolling: startPollingMiner,
  } = useQuery(MINER_STATS_QUERY);

  useEffect(() => {
    startPollingMiner(process.env.NEXT_PUBLIC_POLLING_TIME);
    dispatch(
      updateMinerStats({
        loading: loadingMiner,
        error: errorMiner,
        data: dataMiner,
      })
    );
  }, [startPollingMiner, dispatch, loadingMiner, errorMiner, dataMiner]);

  // Mcu data
  const {
    loading: loadingMcu,
    error: errorMcu,
    data: dataMcu,
    startPolling: startPollingMcu,
  } = useQuery(MCU_STATS_QUERY);

  useEffect(() => {
    startPollingMcu(process.env.NEXT_PUBLIC_POLLING_TIME);
    dispatch(
      updateMcuStats({
        loading: loadingMcu,
        error: errorMcu,
        data: dataMcu,
      })
    );
  }, [startPollingMcu, dispatch, loadingMcu, errorMcu, dataMcu]);

  // Node data
  const {
    loading: loadingNode,
    error: errorNode,
    data: dataNode,
    startPolling: startPollingNode,
  } = useQuery(NODE_STATS_QUERY);

  useEffect(() => {
    startPollingNode(process.env.NEXT_PUBLIC_POLLING_TIME_NODE);
    dispatch(
      updateNodeStats({
        loading: loadingNode,
        error: errorNode,
        data: dataNode,
      })
    );
  }, [startPollingNode, dispatch, loadingNode, errorNode, dataNode]);

  // Settings data
  const {
    loading: loadingSettings,
    error: errorSettings,
    data: dataSettings,
    startPolling: startPollingSettings,
  } = useQuery(GET_SETTINGS_QUERY);

  useEffect(() => {
    startPollingSettings(process.env.NEXT_PUBLIC_POLLING_TIME);
    dispatch(
      updateSettings({
        loading: loadingSettings,
        error: errorSettings,
        data: dataSettings,
      })
    );
  }, [startPollingSettings, dispatch, loadingSettings, errorSettings, dataSettings]);

  // Actions data
  const {
    loading: loadingAction,
    error: errorAction,
    data: dataAction,
  } = useSelector((state) => state.minerAction);

  const { message: feedbackMessage, type: feedbackType } = useSelector((state) => state.feedback);

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
          minHeight="100vh"
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
            minH="100vh"
            pt="50px"
          >
            <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
              {dataAction && (
                <Alert mb="5" borderRadius={'10px'} status="info">
                  <AlertIcon />
                  <AlertTitle>{dataAction.title}</AlertTitle>
                  {dataAction.description && (
                    <AlertDescription>
                      {dataAction.description}
                    </AlertDescription>
                  )}
                </Alert>
              )}
              {errorAction && (
                <Alert mb="5" borderRadius={'10px'} status="error">
                  <AlertIcon />
                  <AlertTitle>{errorAction.toString()}</AlertTitle>
                </Alert>
              )}
              {feedbackMessage && (
                <Alert mb="5" borderRadius={'10px'} status={feedbackType || 'info'}>
                  <AlertIcon />
                  <AlertDescription>{feedbackMessage}</AlertDescription>
                </Alert>
              )}
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
