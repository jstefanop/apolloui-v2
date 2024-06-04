// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';

import AdminNavbarLinks from './NavbarLinksAdmin';
import NavbarSeconday from './NavbarSecondary';
import {
  MINER_RESTART_QUERY,
  MINER_START_QUERY,
  MINER_STOP_QUERY,
} from '../../graphql/miner';
import { NODE_START_QUERY, NODE_STOP_QUERY } from '../../graphql/node';
import { updateMinerAction } from '../../redux/actions/minerAction';
import { minerSelector } from '../../redux/reselect/miner';
import { nodeSelector } from '../../redux/reselect/node';
import { settingsSelector } from '../../redux/reselect/settings';
import { MCU_REBOOT_QUERY, MCU_SHUTDOWN_QUERY } from '../../graphql/mcu';
import { sendFeedback } from '../../redux/actions/feedback';
import { SidebarResponsive } from '../sidebar/Sidebar';

const AdminNavbar = ({ secondary, message, routes, ...props }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);

  // Miner data
  const {
    loading,
    data: { online, stats },
    error,
  } = useSelector(minerSelector);

  // Node data
  const {
    data: dataNode,
    error: errorNode,
    loading: loadingNode,
  } = useSelector(nodeSelector);

  // Settings data
  const { data: settings } = useSelector(settingsSelector);

  const { blocksCount } = dataNode;

  // Miner actions
  const [startMiner, { loading: loadingMinerStart, error: errorMinerStart }] =
    useLazyQuery(MINER_START_QUERY, { fetchPolicy: 'no-cache' });

  const [stopMiner, { loading: loadingMinerStop, error: errorMinerStop }] =
    useLazyQuery(MINER_STOP_QUERY, { fetchPolicy: 'no-cache' });

  const [
    restartMiner,
    { loading: loadingMinerRestart, error: errorMinerRestart },
  ] = useLazyQuery(MINER_RESTART_QUERY, { fetchPolicy: 'no-cache' });

  // Node actions
  const [startNode, { loading: loadingNodeStart, error: errorNodeStart }] =
    useLazyQuery(NODE_START_QUERY, { fetchPolicy: 'no-cache' });

  const [stopNode, { loading: loadingNodeStop, error: errorNodeStop }] =
    useLazyQuery(NODE_STOP_QUERY, { fetchPolicy: 'no-cache' });

  // MCU actions
  const [rebootMcu, { loading: loadingRebootMcu, error: errorRebootMcu }] =
    useLazyQuery(MCU_REBOOT_QUERY, { fetchPolicy: 'no-cache' });

  const [
    shutdownMcu,
    { loading: loadingShutdownMcu, error: errorShutdownMcu },
  ] = useLazyQuery(MCU_SHUTDOWN_QUERY, { fetchPolicy: 'no-cache' });

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);

    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  });

  const handleSystemAction = (action) => {
    let title;
    let description;
    let loadingAction;
    let errorAction;
    switch (action) {
      case 'stopMiner':
        stopMiner();
        title = 'Stopping miner';
        description = 'Your miner will be stopped in a few seconds';
        loadingAction = loadingMinerStop;
        errorAction = errorMinerStop;
        break;
      case 'startMiner':
        startMiner();
        title = 'Starting miner';
        description =
          'Your miner will be available in a moment, please hold on';
        loadingAction = loadingMinerStart;
        errorAction = errorMinerStart;
        break;
      case 'restartMiner':
        restartMiner();
        title = 'Restarting miner';
        description =
          'Your miner will be available in a moment, please hold on';
        loadingAction = loadingMinerRestart;
        errorAction = errorMinerRestart;
        break;
      case 'stopNode':
        stopNode();
        title = 'Stopping Bitcoin node';
        description = 'Your node will be stopped in a few seconds';
        loadingAction = loadingNodeStart;
        errorAction = errorNodeStart;
        break;
      case 'startNode':
        startNode();
        title = 'Starting Bitcoin node';
        description = 'Your node will be available in a moment, please hold on';
        loadingAction = loadingNodeStop;
        errorAction = errorNodeStop;
        break;
      case 'rebootMcu':
        rebootMcu();
        title = 'Rebooting system';
        description =
          'Your system is rebooting, please wait at least 1 minute you should see stats again';
        loadingAction = loadingRebootMcu;
        errorAction = errorRebootMcu;
        break;
      case 'shutdownMcu':
        shutdownMcu();
        title = 'Shutting down system';
        description =
          'Your system is halting, you will need to start it manually. See you.';
        loadingAction = loadingShutdownMcu;
        errorAction = errorShutdownMcu;
        break;
      default:
        modal = false;
    }

    const dataAction = {
      action,
      title,
      description,
    };

    dispatch(
      updateMinerAction({
        loading: loadingAction,
        error: errorAction,
        data: dataAction,
        status: action.match(/start/i) ? true : false,
        timestamp: Date.now(),
      })
    );

    dispatch(
      sendFeedback({
        message: `${title} - ${description}`,
        type: errorAction ? 'error' : 'success',
      })
    );
  };

  const currentRoute = _.find(routes, { path: router.pathname });

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let mainText = useColorModeValue('navy.700', 'white');
  let secondaryText = useColorModeValue('gray.700', 'white');
  let navbarPosition = 'fixed';
  let navbarFilter = 'none';
  let navbarBackdrop = 'blur(20px)';
  let navbarShadow = 'none';
  let navbarBg = useColorModeValue(
    'rgba(244, 247, 254, 0.2)',
    'rgba(11,20,55,0.5)'
  );
  let navbarBorder = 'transparent';
  let secondaryMargin = '0px';
  let paddingX = '15px';
  let gap = '0px';

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <>
      <Box
        position={navbarPosition}
        boxShadow={navbarShadow}
        bg={navbarBg}
        borderColor={navbarBorder}
        filter={navbarFilter}
        backdropFilter={navbarBackdrop}
        backgroundPosition="center"
        backgroundSize="cover"
        borderRadius="16px"
        borderWidth="1.5px"
        borderStyle="solid"
        transitionDelay="0s, 0s, 0s, 0s"
        transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
        transition-property="box-shadow, background-color, filter, border"
        transitionTimingFunction="linear, linear, linear, linear"
        alignItems={{ xl: 'center' }}
        display={secondary ? 'block' : 'flex'}
        minH="75px"
        justifyContent={{ xl: 'center' }}
        lineHeight="25.6px"
        mx="auto"
        mt={secondaryMargin}
        pb="8px"
        right={{ base: '12px', md: '30px', lg: '30px', xl: '30px' }}
        px={{
          sm: paddingX,
          md: '10px',
        }}
        ps={{
          xl: '12px',
        }}
        pt="8px"
        top={{ base: '12px', md: '16px', xl: '18px' }}
        w={{
          base: 'calc(100vw - 6%)',
          md: 'calc(100vw - 8%)',
          lg: 'calc(100vw - 6%)',
          xl: 'calc(100vw - 300px)',
        }}
      >
        <Flex
          w="100%"
          flexDirection={{
            sm: 'column',
            md: 'row',
          }}
          alignItems={{ xl: 'center' }}
          mb={gap}
        >
          <Box mb={{ sm: '8px', md: '5px' }}>
            <Breadcrumb>
              <BreadcrumbItem color={secondaryText} fontSize="sm">
                {currentRoute && currentRoute.name !== 'Overview' ? (
                  <Link href="/overview">Overview</Link>
                ) : (
                  <Text>Apollo System</Text>
                )}
              </BreadcrumbItem>
            </Breadcrumb>

            <Text
              color={mainText}
              bg="inherit"
              borderRadius="inherit"
              fontWeight="bold"
              fontSize="34px"
              _hover={{ color: { mainText } }}
              _active={{
                bg: 'inherit',
                transform: 'none',
                borderColor: 'transparent',
              }}
              _focus={{
                boxShadow: 'none',
              }}
            >
              {currentRoute && currentRoute.name}
            </Text>
          </Box>

          <Box position={'absolute'} right={2} display={{ base: 'block', md: 'none' }}>
            <SidebarResponsive routes={routes} />
          </Box>

          {currentRoute && currentRoute.name === 'Miner' && (
            <Box ml="5" display={{ base: 'none', xl: 'block' }}>
              <NavbarSeconday
                type={'miner'}
                handleSystemAction={handleSystemAction}
                minerOnline={online}
              />
            </Box>
          )}

          {currentRoute && currentRoute.name === 'Node' && (
            <Box ml="5" display={{ base: 'none', xl: 'block' }}>
              <NavbarSeconday
                type={'node'}
                handleSystemAction={handleSystemAction}
                blocksCount={blocksCount}
              />
            </Box>
          )}

          <Box ms="auto" w={{ base: '100%', md: 'unset' }}>
            <AdminNavbarLinks
              onOpen={props.onOpen}
              secondary={secondary}
              fixed={props.fixed}
              scrolled={scrolled}
              routes={routes}
              handleSystemAction={handleSystemAction}
              minerOnline={online}
              minerStats={stats}
              errorNode={errorNode}
              blocksCount={blocksCount}
              settings={settings}
              error={error}
              loading={loading}
            />
          </Box>
        </Flex>
      </Box>
    </>
  );
};

AdminNavbar.propTypes = {
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};

export default AdminNavbar;
