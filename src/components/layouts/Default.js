import React, { useEffect, useState } from 'react';
import {
  Portal,
  Box,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
  Text,
  Spinner,
  Button,
  Card,
  Icon,
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
import { settingsSelector } from '../../redux/reselect/settings';
import { minerSelector } from '../../redux/reselect/miner';
import { updateMinerAction } from '../../redux/actions/minerAction';
import { CheckIcon } from '@chakra-ui/icons';

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
  }, [
    startPollingSettings,
    dispatch,
    loadingSettings,
    errorSettings,
    dataSettings,
  ]);

  const { message: feedbackMessage, type: feedbackType } = useSelector(
    (state) => state.feedback
  );

  const { status: minerStatus } = useSelector((state) => state.minerAction);

  // Miner online data releseted
  const {
    data: {
      online: minerOnline,
      stats: { date },
    },
  } = useSelector(minerSelector);

  const timestamp = new Date(date).getTime();

  // Settings data reselected
  const {
    data: { nodeEnableSoloMining },
  } = useSelector(settingsSelector);

  // Miner status diff time
  const minerStatusDiffTime = Math.round((Date.now() - timestamp) / 1000);

  const [minerStatusDone, setMinerStatusDone] = useState(false);

  // Reparsing routes
  routes = routes.filter((route) => {
    if (route.name === 'SOLO Mining' && !nodeEnableSoloMining) return false;
    return true;
  });

  useEffect(() => {
    let timeoutId;
    if (minerOnline === minerStatus) setMinerStatusDone(true);
    timeoutId = setTimeout(() => {
      setMinerStatusDone(false);
    }, 5000);

    return () => clearInterval(timeoutId);
  }, [minerOnline, minerStatus]);

  const handleDiscardMinerStatus = () => {
    dispatch(
      updateMinerAction({
        loading: false,
        error: false,
        data: null,
        status: minerOnline,
        timestamp: Date.now(),
      })
    );
  };

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
              {feedbackMessage && (
                <Alert
                  mb="5"
                  borderRadius={'10px'}
                  status={feedbackType || 'info'}
                >
                  <AlertIcon />
                  <AlertDescription>{feedbackMessage}</AlertDescription>
                </Alert>
              )}
              {minerStatus !== minerOnline && minerStatusDiffTime > 30 && (
                <Card
                  mb="5"
                  borderRadius={'10px'}
                  bg={
                    minerStatusDiffTime < 60 ? 'secondaryGray.800' : 'brand.800'
                  }
                  p="4"
                >
                  <Flex justifyContent={'space-between'} flexDirection={'row'}>
                    <Flex align={'center'} color="white">
                      <Spinner size="sm" mr="2" />
                      {minerStatusDiffTime < 60 ? (
                        <Text>
                          Waiting for the current miner status to match the
                          desired one ({minerStatus ? 'Online' : 'Offline'}
                          ).
                        </Text>
                      ) : (
                        <Text>
                          Your miner is still not active, you can try to force
                          restart, wait or dismiss this message
                        </Text>
                      )}
                    </Flex>
                    {minerStatusDiffTime >= 60 && (
                      <Flex>
                        <Button size="xs" mr="3">
                          FORCE
                        </Button>
                        <Button size="xs" onClick={handleDiscardMinerStatus}>
                          DISCARD
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </Card>
              )}
              {minerStatusDone && (
                <Card mb="5" borderRadius={'10px'} bg={'green.300'} p="4">
                  <Flex justifyContent={'space-between'} flexDirection={'row'}>
                    <Flex align={'center'} color="white">
                      <Icon as={CheckIcon} mr="2" />
                      <Text>
                        Your miner is{' '}
                        <strong>{minerOnline ? 'Online' : 'Offline'}</strong>
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
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
