import {
  Box,
  Icon,
  Flex,
  Text,
  Grid,
  GridItem,
  SimpleGrid,
  useColorModeValue,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Button,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { useRef, useEffect, useState } from 'react';
import { BulletList } from 'react-content-loader';
import { useSelector, shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import IconBox from '../components/icons/IconBox';
import Card from '../components/card/Card';
import { soloSelector } from '../redux/reselect/solo';
import { nodeSelector } from '../redux/reselect/node';
import { servicesSelector } from '../redux/reselect/services';
import HashrateCard from '../components/apollo/HashrateCard';
import BestShare from '../components/apollo/BestShareCard';
import MiniStatistics from '../components/UI/MiniStatistics';
import { LastShareIcon } from '../components/UI/Icons/LastShareIcon';
import { PowerOffSolidIcon } from '../components/UI/Icons/PowerOffSolidIcon';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import { settingsSelector } from '../redux/reselect/settings';
import { MinerIcon } from '../components/UI/Icons/MinerIcon';
import { SharesSentIcon } from '../components/UI/Icons/SharesSentIcon';
import { SharesAcceptedIcon } from '../components/UI/Icons/SharesAcceptedIcon';
import { SharesRejectedIcon } from '../components/UI/Icons/SharesRejectedIcon';
import { FaUserCog, FaUserFriends } from 'react-icons/fa';
import { GiDiamondTrophy } from 'react-icons/gi';
import ActiveBadge from '../components/apollo/ActiveBadge';
import PanelGrid from '../components/UI/PanelGrid';
import Head from 'next/head';
import moment from '../lib/moment';
import _ from 'lodash';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import {
  filterRecentShares,
  shortenBitcoinAddress,
  calculateDailyChance,
  calculatePerBlockChance,
  calculateMonthlyChance,
  calculateYearlyChance,
  convertHashrateStringToValue,
  displayHashrate,
  useDailyChanceVisualizations,
  useDailyChanceVisualization,
} from '../lib/utils';
import { mcuSelector } from '../redux/reselect/mcu';
import { InfoIcon } from '@chakra-ui/icons';
import SoloMiningDrawer from '../components/apollo/SoloMiningDrawer';
import SoloMiningStatus from '../components/UI/SoloMiningStatus';
import ColorBars from '../components/UI/ColorBars';
import { useLazyQuery } from '@apollo/client';
import { SOLO_START_QUERY } from '../graphql/solo';
import { useDeviceType } from '../contexts/DeviceConfigContext';

const SoloMining = () => {
  const intl = useIntl();
  const router = useRouter();
  const deviceType = useDeviceType();

  const {
    isOpen: isVisibleBanner,
    onClose: onCLoseBanner,
    onOpen: onOpenBanner,
  } = useDisclosure();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white', 'white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );
  
  // Tooltip colors
  const tooltipBg = useColorModeValue('gray.100', 'brand.700');
  const tooltipColor = useColorModeValue('gray.800', 'white');
  const tooltipDividerColor = useColorModeValue('gray.300', 'whiteAlpha.300');

  const isBannerDisabled = typeof window !== 'undefined' ? localStorage.getItem('solo-mining-banner-disabled') : null;
  const [showBanner, setShowBanner] = useState(!isBannerDisabled);

  const { data: servicesStatus } = useSelector(servicesSelector, shallowEqual);

  // Solo service actions
  const [startSolo, { loading: loadingSoloStart }] = useLazyQuery(
    SOLO_START_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const handleStartSolo = () => {
    startSolo();
  };

  // Settings data
  const {
    loading: loadingSettings,
    data: dataSettings,
    error: errorSettings,
  } = useSelector(settingsSelector, shallowEqual);

  const { nodeEnableSoloMining } = dataSettings;

  // Solo data
  const {
    loading: loadingSolo,
    data: soloData,
    error: errorSolo,
  } = useSelector(soloSelector, shallowEqual);

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector, shallowEqual);

  const { difficulty, networkhashps, blocksCount, blockHeader } =
    dataNode || {};

  // Check if node is synced (same logic as in node.js)
  const isNodeSynced = blocksCount === blockHeader && blocksCount > 0;

  // Mcu data
  const { data: dataMcu, error: errorMcu } = useSelector(
    mcuSelector,
    shallowEqual
  );

  const { network } = dataMcu;

  const eth0 = _.find(network, { name: 'eth0' });
  const wlan0 = _.find(network, { name: 'wlan0' });

  const localAddress = wlan0?.address || eth0?.address;

  // Set Previous state for CountUp component
  const prevData = useRef(soloData);

  useEffect(() => {
    // Store the current value directly when soloData changes
    prevData.current = soloData;
  }, [soloData]);

  useEffect(() => {
    // Don't redirect for solo-node devices, they always have solo mining
    if (deviceType !== 'solo-node' && !loadingSettings && !nodeEnableSoloMining) router.push('/miner');
  }, [deviceType, nodeEnableSoloMining, loadingSettings, router]);

  // Extract previous data for animations
  const prevPoolData = prevData.current?.pool || {};
  const prevCkPoolGlobalHashrate = prevPoolData.hashrate1m ? displayHashrate(convertHashrateStringToValue(prevPoolData.hashrate1m, 'GH/s'), 'GH/s', false, 2, true) : null;
  const prevCkPoolGlobalAvgHashrate = prevPoolData.hashrate1hr ? displayHashrate(convertHashrateStringToValue(prevPoolData.hashrate1hr, 'GH/s'), 'GH/s', false, 2, true) : null;
  const prevCkPoolGlobalBestshare = prevPoolData.bestshare || 0;

  // Extract data from solo service
  const {
    pool: poolData,
    users: soloUsers = [],
    summary: poolSummary,
    blockFound,
    timestamp,
    hasUsers = false,
  } = soloData || {};

  // Map solo service data to original variable names for compatibility
  const ckPoolGlobalHashrate = poolData?.hashrate1m ? displayHashrate(convertHashrateStringToValue(poolData.hashrate1m, 'GH/s'), 'GH/s', false, 2, true) : null;
  const ckPoolGlobalAvgHashrate = poolData?.hashrate1hr ? displayHashrate(convertHashrateStringToValue(poolData.hashrate1hr, 'GH/s'), 'GH/s', false, 2, true) : null;
  // Only show bestshare if there are users connected, otherwise show null (which will display as N/A)
  const ckPoolGlobalBestshare = hasUsers ? (poolData?.bestshare || 0) : null;
  const ckPoolHashrateInGhs = poolData?.hashrate1m ? convertHashrateStringToValue(poolData.hashrate1m, 'GH/s') : 0;
  const ckUsersCount = poolData?.Users || 0;
  const ckWorkersCount = poolData?.Workers || 0;
  const ckIdle = poolData?.Idle || 0;
  const ckPoolLastUpdate = poolData?.lastupdate ? moment.unix(poolData.lastupdate).fromNow() : null;
  const ckRuntime = poolData?.runtime ? moment().to(moment().subtract(poolData.runtime, 'seconds'), true) : null;
  const ckDisconnected = poolData?.lastupdate ? moment().diff(moment.unix(poolData.lastupdate), 'seconds') > 90 : true;
  const ckSharesAccepted = poolData?.accepted || 0;
  const ckSharesRejected = poolData?.rejected || 0;
  const ckUsersUnsorted = soloUsers || [];
  
  // Sort users alphabetically by wallet address
  const ckUsers = [...ckUsersUnsorted].sort((a, b) => {
    const walletA = a.worker?.[0]?.workername?.split('.')[0] || '';
    const walletB = b.worker?.[0]?.workername?.split('.')[0] || '';
    return walletA.localeCompare(walletB);
  });

  const prevBestSharePerc =
    1 / (((prevCkPoolGlobalBestshare * 1e11) / networkhashps) * 144) || 0;

  const dailyChance = calculateDailyChance(ckPoolHashrateInGhs, networkhashps);
  const perBlockChance = calculatePerBlockChance(
    ckPoolHashrateInGhs,
    networkhashps
  );
  const monthlyChance = calculateMonthlyChance(
    ckPoolHashrateInGhs,
    networkhashps
  );
  const yearlyChance = calculateYearlyChance(
    ckPoolHashrateInGhs,
    networkhashps
  );

  // Calculate visualizations for all time periods
  const globalDailyChanceVisualization =
    useDailyChanceVisualization(dailyChance);
  const globalPerBlockChanceVisualization =
    useDailyChanceVisualization(perBlockChance);
  const globalMonthlyChanceVisualization =
    useDailyChanceVisualization(monthlyChance);
  const globalYearlyChanceVisualization =
    useDailyChanceVisualization(yearlyChance);

  const desiredKeys = [
    'hashrate5m',
    'hashrate1d',
    'lastshare',
    'shares',
    'bestever',
    'worker',
  ];

  const boardNames = [];

  // Get all daily chance visualizations at once
  const dailyChanceVisualizations = useDailyChanceVisualizations(
    ckUsers,
    networkhashps
  );

  const dataTableBoards = ckUsers.map((element, index) => {
    if (!element) return;
    const mappedArray = [];
    desiredKeys.forEach((key) => {
      if (key in element) {
        let value, icon;
        switch (key) {
          case 'hashrate5m':
            value = `${element[key]} (5m)`;
            icon = MinerIcon;
            break;
          case 'hashrate1d':
            value = `${element[key]} (1d)`;
            icon = MinerIcon;
            break;
          case 'worker':
            boardNames.push(
              element[key][0] ? element[key][0]?.workername.split('.')[0] : ''
            );
            break;
          case 'lastshare':
            value = `${moment(element[key], 'X').fromNow()}`;
            icon = LastShareIcon;
            break;
          case 'shares':
            value = `${element[key]?.toLocaleString('en-US')}`;
            icon = SharesSentIcon;
            break;
          case 'bestever':
            value =
              difficulty > 0
                ? `${element[key].toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}`
                : 'n.a.';
            icon = BlocksIcon;
            break;
        }
        mappedArray.push({ value, icon });
      }
    });

    // Add daily chance visualization if available
    const visualization = dailyChanceVisualizations[index];
    if (visualization) {
      mappedArray.push({
        name: 'Daily chance',
        value: (
          <Flex align="center" gap={2}>
            <Box color={visualization.color}>{visualization.text}</Box>
          </Flex>
        ),
        icon: GiDiamondTrophy,
      });
    }
    return mappedArray;
  });

  const ckWorkers = ckUsers.map((element) => {
    const totalWorkers = _.size(element.worker);
    const activeWorkers = _.size(filterRecentShares(element.worker, 180));
    return { ...element.worker, totalWorkers, activeWorkers };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(
    Array(dataTableBoards.length).fill(false)
  );

  const handleOpen = (index) => {
    const newDrawerState = [...isDrawerOpen];
    newDrawerState[index] = true;
    setIsDrawerOpen(newDrawerState);
  };

  const handleClose = (index) => {
    const newDrawerState = [...isDrawerOpen];
    newDrawerState[index] = false;
    setIsDrawerOpen(newDrawerState);
  };

  const handleCloseBanner = () => {
    onCLoseBanner();
    setShowBanner(false);
    localStorage.setItem('solo-mining-banner-disabled', 'true');
  };
  const handleOpenBanner = () => {
    onOpenBanner();
    setShowBanner(true);
    localStorage.removeItem('solo-mining-banner-disabled');
  };

  return (
    <Box>
      <Head>
        <title>
          {ckPoolGlobalHashrate
            ? intl.formatMessage(
                {
                  id: 'solo_mining.title',
                  defaultMessage: 'Apollo Solo Pool {hashrate}',
                },
                {
                  hashrate: `${ckPoolGlobalHashrate.value} ${ckPoolGlobalHashrate.unit}`,
                }
              )
            : intl.formatMessage({
                id: 'solo_mining.title',
                defaultMessage: 'Apollo Solo Pool',
              })}
        </title>
      </Head>

      {/* Show node not synced alert */}
      {!isNodeSynced && (
        <Flex minHeight="60vh" align="center" justify="center" p={4}>
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            maxW="600px"
            borderRadius="lg"
            p={8}
          >
            <AlertIcon boxSize="40px" mr={0} mb={4} />
            <AlertTitle mt={4} mb={2} fontSize="lg">
              {intl.formatMessage({ id: 'solo_mining.node_not_synced.title' })}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {intl.formatMessage({ id: 'solo_mining.node_not_synced.description' })}
            </AlertDescription>
            {blocksCount > 0 && blockHeader > 0 && (
              <Box mt={4}>
                <Text fontSize="sm" color="gray.600">
                  {intl.formatMessage(
                    { id: 'node.stats.synching' },
                    { percentage: ((blocksCount / blockHeader) * 100).toFixed(2) }
                  )}
                </Text>
              </Box>
            )}
          </Alert>
        </Flex>
      )}

      {/* Show SoloMiningStatus when solo service is not online */}
      {isNodeSynced && servicesStatus?.solo?.status !== 'online' && (
        <Flex height="60vh" align="center" justify="center">
          <SoloMiningStatus
            serviceStatus={servicesStatus}
            ckPoolLastUpdate={ckPoolLastUpdate}
            ckDisconnected={ckDisconnected}
            blocksCount={blocksCount}
            blockHeader={blockHeader}
            onStart={handleStartSolo}
          />
        </Flex>
      )}
      
      {/* Show content only when solo service is online AND node is synced */}
      {isNodeSynced && servicesStatus?.solo?.status === 'online' && (
        <>
          {showBanner || isVisibleBanner ? (
            <Alert mb="5" borderRadius={'10px'} status={'info'}>
              <AlertIcon mr={4} />
              <AlertTitle>
                {intl.formatMessage({ id: 'solo_mining.banner.title' })}
              </AlertTitle>
              <AlertDescription>
                {intl.formatMessage(
                  { id: 'solo_mining.banner.description' },
                  { address: localAddress }
                )}
              </AlertDescription>
              <CloseButton
                position="absolute"
                right={2}
                top={2}
                onClick={handleCloseBanner}
              />
            </Alert>
          ) : (
            <Button
              mb={4}
              rightIcon={<InfoIcon />}
              onClick={handleOpenBanner}
              variant="lightBrand"
              size={'sm'}
            >
              {intl.formatMessage({ id: 'solo_mining.banner.connect' })}
            </Button>
          )}

          <Grid
            templateAreas={{
              base: `'hashrate' 'bestshare' 'summary' 'info' 'users'`,
              lg: `'hashrate hashrate summary summary' 'bestshare info users users'`,
              '3xl': `'hashrate hashrate summary summary' 'bestshare bestshare info users'`,
            }}
            templateRows={{
              base: 'auto auto auto auto auto',
              lg: 'auto auto',
            }}
            templateColumns={{
              base: '1fr',
              lg: '1fr 1fr 1fr 1fr',
            }}
            gap={'20px'}
            mb={'10px'}
          >
            <GridItem gridArea="hashrate">
              <HashrateCard
                loading={loadingSolo}
                errors={errorSolo}
                data={ckPoolGlobalHashrate}
                avgData={ckPoolGlobalAvgHashrate}
                prevData={prevCkPoolGlobalHashrate}
                prevAvgData={prevCkPoolGlobalAvgHashrate}
                shadow={shadow}
                iconColor={iconColor}
                status={servicesStatus?.solo?.status}
                title="SOLO Hashrate"
              />
            </GridItem>

            <GridItem gridArea="bestshare">
              <BestShare
                loading={loadingSolo && loadingNode}
                errors={errorSolo}
                data={ckPoolGlobalBestshare}
                prevData={prevCkPoolGlobalBestshare}
                shadow={shadow}
                iconColor={iconColor}
              />
            </GridItem>

            <GridItem gridArea="summary">
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 1, '3xl': 2 }}
                gap="20px"
              >
                <MiniStatistics
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <Icon
                          as={SharesAcceptedIcon}
                          w="32px"
                          h="32px"
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={intl.formatMessage({
                    id: 'solo_mining.stats.accepted_shares',
                  })}
                  value={
                    <span>{ckSharesAccepted?.toLocaleString('en-US')}</span>
                  }
                  reversed={true}
                />

                <MiniStatistics
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <Icon
                          as={SharesRejectedIcon}
                          w="32px"
                          h="32px"
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={intl.formatMessage({
                    id: 'solo_mining.stats.rejected_shares',
                  })}
                  value={
                    <span>{ckSharesRejected?.toLocaleString('en-US')}</span>
                  }
                  reversed={true}
                />

                <MiniStatistics
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <LastShareIcon
                          w="32px"
                          h="32px"
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={intl.formatMessage({
                    id: 'solo_mining.stats.last_share',
                  })}
                  value={
                    !ckDisconnected && ckPoolLastUpdate
                      ? ckPoolLastUpdate?.replace('a few', '')
                      : 'N/A'
                  }
                  reversed={true}
                />

                <MiniStatistics
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <PowerOffSolidIcon
                          w="32px"
                          h="32px"
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={intl.formatMessage({ id: 'solo_mining.stats.uptime' })}
                  value={(!ckDisconnected && ckRuntime) || 'N/A'}
                  reversed={true}
                />
              </SimpleGrid>
            </GridItem>

            <GridItem gridArea="info">
              <Card py="15px" pr="40px" bgColor={cardColor} boxShadow={shadow}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    {intl.formatMessage({ id: 'solo_mining.info.title' })}
                  </Text>
                </Flex>
                {loadingSolo ? (
                  <BulletList />
                ) : (
                  <Flex my="auto" direction="column">
                    <Tooltip
                      hasArrow
                      placement="top"
                      bg={tooltipBg}
                      color={tooltipColor}
                      p={4}
                      borderRadius="lg"
                      boxShadow="xl"
                      label={
                        <Box minW="280px">
                          <Text fontWeight="bold" mb={3} fontSize="sm">
                            {intl.formatMessage({ id: 'solo_mining.info.other_chances' })}
                          </Text>
                          <Flex direction="column" gap={2}>
                            <Flex justify="space-between" align="center" gap={6}>
                              <Text fontSize="sm" whiteSpace="nowrap">
                                {intl.formatMessage({ id: 'solo_mining.info.per_block_chance_title' })}
                              </Text>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={globalPerBlockChanceVisualization?.color}
                                whiteSpace="nowrap"
                              >
                                {globalPerBlockChanceVisualization?.text || 'N/A'}
                              </Text>
                            </Flex>
                            <Divider borderColor={tooltipDividerColor} />
                            <Flex justify="space-between" align="center" gap={6}>
                              <Text fontSize="sm" whiteSpace="nowrap">
                                {intl.formatMessage({ id: 'solo_mining.info.monthly_chance_title' })}
                              </Text>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={globalMonthlyChanceVisualization?.color}
                                whiteSpace="nowrap"
                              >
                                {globalMonthlyChanceVisualization?.text || 'N/A'}
                              </Text>
                            </Flex>
                            <Divider borderColor={tooltipDividerColor} />
                            <Flex justify="space-between" align="center" gap={6}>
                              <Text fontSize="sm" whiteSpace="nowrap">
                                {intl.formatMessage({ id: 'solo_mining.info.yearly_chance_title' })}
                              </Text>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={globalYearlyChanceVisualization?.color}
                                whiteSpace="nowrap"
                              >
                                {globalYearlyChanceVisualization?.text || 'N/A'}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      }
                    >
                      <Box cursor="pointer">
                        <NoCardStatistics
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <Icon
                                  w="32px"
                                  h="32px"
                                  as={GiDiamondTrophy}
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <Flex align="center" gap={1}>
                              {intl.formatMessage({
                                id: 'solo_mining.info.daily_chance',
                              })}
                              <InfoIcon boxSize={3} color="secondaryGray.500" />
                            </Flex>
                          }
                          value={
                            dailyChance && globalDailyChanceVisualization ? (
                              <Flex align="center" gap={2}>
                                <Box color={globalDailyChanceVisualization.color}>
                                  {globalDailyChanceVisualization.text}
                                </Box>
                              </Flex>
                            ) : (
                              'N/A'
                            )
                          }
                          reversed={true}
                        />
                      </Box>
                    </Tooltip>
                    <NoCardStatistics
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          bg={'transparent'}
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={FaUserFriends}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={intl.formatMessage({
                        id: 'solo_mining.info.users',
                      })}
                      value={ckUsersCount}
                      reversed={true}
                    />
                    <NoCardStatistics
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          bg={'transparent'}
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={FaUserCog}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={intl.formatMessage({
                        id: 'solo_mining.info.workers',
                      })}
                      value={ckWorkersCount}
                      reversed={true}
                    />
                    <NoCardStatistics
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          bg={'transparent'}
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={FaUserCog}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={intl.formatMessage({ id: 'solo_mining.info.idle' })}
                      value={ckIdle}
                      reversed={true}
                    />
                  </Flex>
                )}
              </Card>
            </GridItem>
            <GridItem gridArea="users">
              <Card py="15px" bgColor={cardColor} boxShadow={shadow} h="100%">
                <Flex
                  align={{ sm: 'flex-start', lg: 'center' }}
                  justify="space-between"
                >
                  <Flex m="2">
                    <Text fontSize="lg" fontWeight="800">
                      {intl.formatMessage({ id: 'solo_mining.users.title' })}
                    </Text>
                  </Flex>
                </Flex>
                {loadingSolo ? (
                  <BulletList />
                ) : !dataTableBoards.length ? (
                  <Text m="3">
                    {intl.formatMessage({
                      id: 'solo_mining.users.no_active_workers',
                    })}
                  </Text>
                ) : (
                  <Box
                    overflowY={'auto'}
                    maxH="400px"
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '16px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                      },
                    }}
                  >
                    {dataTableBoards.map((dataTable, index) => (
                      <Box mt="3" key={index}>
                        <SoloMiningDrawer
                          isOpen={isDrawerOpen[index]}
                          onClose={() => handleClose(index)}
                          placement="right"
                          data={ckUsers[index].worker}
                          user={boardNames[index]}
                          difficulty={difficulty}
                          networkhashps={networkhashps}
                        />
                        <Flex justifyContent={{ base: 'flex-end' }} mr="4">
                          <Button
                            bgColor="brand.700"
                            color="white"
                            variant="solid"
                            size="sm"
                            onClick={() => handleOpen(index)}
                          >
                            {intl.formatMessage({
                              id: 'solo_mining.users.show_all_data',
                            })}
                          </Button>
                          {typeof ckWorkers[index].activeWorkers !==
                            'undefined' &&
                            ckWorkers[index].activeWorkers !== null &&
                            typeof ckWorkers[index].totalWorkers !==
                              'undefined' &&
                            ckWorkers[index].totalWorkers !== null && (
                              <ActiveBadge
                                active={ckWorkers[index].activeWorkers}
                                total={ckWorkers[index].totalWorkers}
                                title={intl.formatMessage({
                                  id: 'solo_mining.users.active',
                                })}
                              />
                            )}
                        </Flex>
                        <Flex
                          align="flex-start"
                          mt={{ base: '0', md: '4' }}
                          mr={{ base: '4' }}
                        >
                          <Text fontSize="lg" fontWeight="800">
                            {shortenBitcoinAddress(boardNames[index], 10)}
                          </Text>
                        </Flex>
                        <Flex
                          direction={{ base: 'column', md: 'row' }}
                          justify="space-between"
                          align="flex-start"
                        >
                          <PanelGrid data={dataTable} />
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </GridItem>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SoloMining;
