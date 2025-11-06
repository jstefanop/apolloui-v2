import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Text,
  Flex,
  Stack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import _ from 'lodash';
import Head from 'next/head';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoading } from '../redux/slices/analyticsSlice';
import { BulletList, List } from 'react-content-loader';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import {
  bytesToSize,
  getNodeErrorMessage,
  formatTemperature,
  calculateWattsPerTh,
  convertHashrateStringToValue,
  displayHashrate,
  numberToText,
  calculateDailyChance,
} from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { minerSelector } from '../redux/reselect/miner';
import { servicesSelector } from '../redux/reselect/services';
import { soloSelector } from '../redux/reselect/solo';
import { analyticsSelector } from '../redux/reselect/analytics';
import { mcuSelector } from '../redux/reselect/mcu';
import { MinerTempIcon } from '../components/UI/Icons/MinerTemp';
import { McuTempIcon } from '../components/UI/Icons/McuTempIcon';
import { MinerIcon } from '../components/UI/Icons/MinerIcon';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { BugIcon } from '../components/UI/Icons/BugIcon';
import { CpuIcon } from '../components/UI/Icons/CpuIcon';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { MemoryIcon } from '../components/UI/Icons/MemoryIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import HashrateCard from '../components/apollo/HashrateCard';
import PowerCard from '../components/apollo/PowerCard';
import { BlockchainIcon } from '../components/UI/Icons/BlockchainIcon';
import { settingsSelector } from '../redux/reselect/settings';
import HashrateChart from '../components/apollo/HashrateChart';
import { MdOfflineBolt } from 'react-icons/md';
import { GiDiamondTrophy } from 'react-icons/gi';
import CountUp from 'react-countup';
import { useDeviceType } from '../contexts/DeviceConfigContext';

const Overview = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );
  const deviceType = useDeviceType();

  const { data: servicesStatus } = useSelector(servicesSelector, shallowEqual);

  const nodeStatus = servicesStatus?.node?.status;

  // Miner data
  const {
    loading: loadingMiner,
    data: minerData,
    error: errorMiner,
  } = useSelector(minerSelector, shallowEqual);

  const dataMiner = useMemo(
    () => minerData?.stats || minerData || {},
    [minerData]
  );

  // Solo data
  const {
    loading: loadingSolo,
    data: soloData,
    error: errorSolo,
  } = useSelector(soloSelector, shallowEqual);

  const dataSolo = useMemo(() => soloData?.stats || soloData || {}, [soloData]);

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector, shallowEqual);

  const {
    connectionCount = 0,
    blocksCount = 0,
    sizeOnDisk = 0,
  } = dataNode || {};

  // Solo KPI calculations
  const soloKPI = useMemo(() => {
    const poolData = dataSolo?.pool;
    if (!poolData) return null;

    const bestshare = poolData.bestshare;
    const networkhashps = dataNode?.networkhashps || 0;

    // Use the same method as solo-mining.js to get hashrate value and unit
    const hashrateObject = poolData?.hashrate1m
      ? displayHashrate(
          convertHashrateStringToValue(poolData.hashrate1m, 'GH/s'),
          'GH/s',
          false,
          2,
          true
        )
      : null;
    const hashrateValue = hashrateObject?.value || 0;
    const hashrateUnit = hashrateObject?.unit || '';

    // Calculate daily chance of solving a block using the same method as solo-mining.js
    const hashrateInGhs = poolData?.hashrate1m
      ? convertHashrateStringToValue(poolData.hashrate1m, 'GH/s')
      : 0;
    const dailyChance = calculateDailyChance(hashrateInGhs, networkhashps);

    return {
      hashrate: hashrateValue,
      hashrateUnit: hashrateUnit,
      bestshare,
      dailyChance,
      hashrateInGhs,
    };
  }, [dataSolo, dataNode]);

  // Mcu data
  const {
    loading: loadingMcu,
    data: dataMcu,
    error: errorMcu,
  } = useSelector(mcuSelector, shallowEqual);

  const { temperature: mcuTemperature, cpu, disks, memory } = dataMcu || {};

  const { threads: cpuCores, usedPercent: cpuUsage } = cpu || {};

  const mcuPrimaryDisk = _.find(disks, { mountPoint: '/' });
  const { used: diskUsed, total: diskTotal } = mcuPrimaryDisk || {};

  const { used: memoryUsed, total: memoryTotal } = memory || {};

  // Analytics data
  const {
    loading: loadingAnalytics,
    data: dataAnalytics,
    error: errorAnalytics,
  } = useSelector(analyticsSelector, shallowEqual);

  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode, intl);

  // Settings data
  const { data: settings } = useSelector(settingsSelector, shallowEqual);

  const { nodeMaxConnections, temperatureUnit } = settings || {};

  // Set Previous state for CountUp component
  const prevData = useRef(null);

  // Set Previous state for Solo KPI CountUp components
  const prevSoloData = useRef(null);

  useEffect(() => {
    if (dataMiner) {
      // Keep only the values needed for CountUp animations
      prevData.current = {
        globalHashrate: dataMiner.globalHashrate,
        globalAvgHashrate: dataMiner.globalAvgHashrate,
        minerPower: dataMiner.minerPower,
        avgBoardTemp: dataMiner.avgBoardTemp,
        avgMcuTemp: dataMiner.avgMcuTemp,
        avgFanSpeed: dataMiner.avgFanSpeed,
        avgVoltage: dataMiner.avgVoltage,
        avgFrequency: dataMiner.avgFrequency,
        avgMemory: dataMiner.avgMemory,
        avgConnections: dataMiner.avgConnections,
        avgBlocks: dataMiner.avgBlocks,
        avgDiskSize: dataMiner.avgDiskSize,
      };
    }
  }, [dataMiner]);

  // Update previous solo data when it changes
  useEffect(() => {
    if (soloKPI) {
      prevSoloData.current = {
        hashrate: soloKPI.hashrate,
        dailyChance: soloKPI.dailyChance,
      };
    }
  }, [soloKPI]);

  // Extract only the current values we need
  const {
    globalHashrate,
    globalAvgHashrate,
    minerPower,
    avgBoardTemp,
    avgBoardErrors,
  } = dataMiner || {};

  // Keep only the previous values needed for CountUp animations
  const {
    globalHashrate: prevGlobalHashrate,
    globalAvgHashrate: prevGlobalAvgHashrate,
    minerPower: prevMinerPower,
    avgBoardTemp: prevAvgBoardTemp,
    avgBoardErrors: prevAvgBoardErrors,
  } = prevData.current || {};

  const prevDataNode = useRef(null);

  useEffect(() => {
    if (dataNode) {
      // Keep only the values needed for CountUp animations
      prevDataNode.current = {
        connectionCount: dataNode.connectionCount,
        blocksCount: dataNode.blocksCount,
      };
    }
    return () => {
      prevDataNode.current = null;
    };
  }, [dataNode]);

  const { connectionCount: prevConnectionCount, blocksCount: prevBlocksCount } =
    prevDataNode.current || {};

  // Calculate watts per TH/s
  const wattsPerTh = calculateWattsPerTh(
    minerPower?.value || minerPower || 0,
    globalHashrate?.value || globalHashrate || 0
  );
  const prevWattsPerTh = calculateWattsPerTh(
    prevMinerPower?.value || prevMinerPower || 0,
    prevGlobalHashrate?.value || prevGlobalHashrate || 0
  );

  // Set loading state when component mounts to show cached data
  useEffect(() => {
    // Set loading to true to show cached data while fetching new data
    dispatch(setAnalyticsLoading(true));

    return () => {
      // Don't clear data on unmount, let it stay in cache
      // Only set loading to false to indicate we're not actively loading
      dispatch(setAnalyticsLoading(false));
    };
  }, [dispatch]);

  return (
    <Box>
      <Head>
        <title>
          <FormattedMessage
            id="overview.title"
            defaultMessage="Apollo Overview"
          />
        </title>
      </Head>
      {errorNode && errorMcu && !errorMiner ? (
        <Alert borderRadius={'10px'} status="warning">
          <AlertIcon />
          <AlertTitle>
            <FormattedMessage
              id="overview.warning.title"
              defaultMessage="Warning"
            />
          </AlertTitle>
          <AlertDescription>
            <FormattedMessage
              id="overview.warning.description"
              defaultMessage="There is a problem getting data from the server."
            />
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Solo Status Widgets - Top row */}
          {servicesStatus?.solo?.status === 'online' ? (
            <Grid
              templateAreas={{
                base: `'soloHashrate' 'soloBestShare' 'soloDailyChance'`,
                lg: `'soloHashrate soloBestShare soloDailyChance'`,
                '3xl': `'soloHashrate soloBestShare soloDailyChance'`,
              }}
              templateRows={{
                base: 'auto',
                lg: 'auto',
              }}
              templateColumns={{
                base: '1fr',
                lg: 'repeat(3, 1fr)',
              }}
              gap={'20px'}
              mb={'20px'}
              transition="all 0.3s ease-in-out"
              width="100%"
              position="relative"
            >
              <GridItem gridArea="soloHashrate">
                <Card
                  bgColor={cardColor}
                  boxShadow={shadow}
                  py="15px"
                  pb="30px"
                  height="100%"
                >
                  <Flex
                    height="100%"
                    align="center"
                    justify="flex-start"
                    direction="row"
                  >
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <Icon
                          w="32px"
                          h="32px"
                          as={MinerIcon}
                          color={iconColorReversed}
                        />
                      }
                      mr="4"
                    />
                    <Flex direction="column">
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        <FormattedMessage
                          id="overview.solo.hashrate"
                          defaultMessage="Solo Hashrate"
                        />
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="800"
                        color={iconColorReversed}
                      >
                        {soloKPI?.hashrate ? (
                          <CountUp
                            start={prevSoloData.current?.hashrate || 0}
                            end={soloKPI.hashrate}
                            duration={1.5}
                            separator=","
                            decimals={2}
                            suffix={` ${soloKPI.hashrateUnit || ''}`}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </GridItem>

              <GridItem gridArea="soloBestShare">
                <Card
                  bgColor={cardColor}
                  boxShadow={shadow}
                  py="15px"
                  pb="30px"
                  height="100%"
                >
                  <Flex
                    height="100%"
                    align="center"
                    justify="flex-start"
                    direction="row"
                  >
                    <IconBox
                      w="56px"
                      h="56px"
                      bg={'transparent'}
                      icon={
                        <Icon
                          w="32px"
                          h="32px"
                          as={BlocksIcon}
                          color={iconColorReversed}
                        />
                      }
                      mr="4"
                    />
                    <Flex direction="column">
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        <FormattedMessage
                          id="overview.solo.best_share"
                          defaultMessage="Solo Best Share"
                        />
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="800"
                        color={iconColorReversed}
                      >
                        {soloKPI?.bestshare
                          ? numberToText(soloKPI.bestshare, intl)
                          : 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </GridItem>

              <GridItem gridArea="soloDailyChance">
                <Card
                  bgColor={cardColor}
                  boxShadow={shadow}
                  py="15px"
                  pb="30px"
                  height="100%"
                >
                  <Flex
                    height="100%"
                    align="center"
                    justify="flex-start"
                    direction="row"
                  >
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
                      mr="4"
                    />
                    <Flex direction="column">
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        <FormattedMessage
                          id="overview.solo.daily_chance"
                          defaultMessage="Daily Chance"
                        />
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="800"
                        color={iconColorReversed}
                      >
                        {soloKPI?.dailyChance ? (
                          <CountUp
                            start={prevSoloData.current?.dailyChance || 0}
                            end={soloKPI?.dailyChance || 0}
                            duration={2}
                            separator=","
                            decimals={0}
                            suffix=""
                            prefix="1 in "
                          />
                        ) : (
                          'N/A'
                        )}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </GridItem>
            </Grid>
          ) : (
            <Card
              bgColor={cardColor}
              boxShadow={shadow}
              py="15px"
              pb="30px"
              mb="20px"
              height="100px"
            >
              {servicesStatus?.solo?.status === 'pending' ? (
                <Flex
                  height="100%"
                  align="center"
                  justify="center"
                  direction="row"
                >
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Spinner size="lg" thickness="4px" color="brand.500" />
                    }
                    mr="4"
                  />
                  <Text fontSize="md" fontWeight="400" color="gray.600">
                    <FormattedMessage
                      id="overview.solo.pending"
                      defaultMessage="Pending... Please wait."
                    />
                  </Text>
                </Flex>
              ) : servicesStatus?.solo?.status === 'offline' ? (
                <Flex
                  height="100%"
                  align="center"
                  justify="center"
                  direction="row"
                >
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon
                        w="32px"
                        h="32px"
                        as={MdOfflineBolt}
                        color="red.500"
                      />
                    }
                    mr="4"
                  />
                  <Text fontSize="md" fontWeight="400" color="gray.600">
                    <FormattedMessage
                      id="overview.solo.offline"
                      defaultMessage="Solo service is offline."
                    />
                  </Text>
                </Flex>
              ) : loadingSolo ? (
                <List />
              ) : errorSolo ? (
                <Alert borderRadius={'10px'} status="error">
                  <AlertIcon />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorSolo}</AlertDescription>
                </Alert>
              ) : (
                <Flex
                  height="100%"
                  align="center"
                  justify="center"
                  direction="row"
                >
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon w="32px" h="32px" as={MinerIcon} color="gray.400" />
                    }
                    mr="4"
                  />
                  <Text fontSize="md" fontWeight="400" color="gray.600">
                    <FormattedMessage
                      id="overview.solo.unknown"
                      defaultMessage="Solo service status unknown."
                    />
                  </Text>
                </Flex>
              )}
            </Card>
          )}

          <Grid
            templateAreas={deviceType === 'solo-node' ? {
              base: `'node' 'gauges'`,
              lg: `'node node node node' 'gauges gauges gauges gauges'`,
              '3xl': `'node node node node' 'gauges gauges gauges gauges'`,
            } : {
              base: `'hashrate' 'chart' 'temperatures' 'power' 'node' 'gauges'`,
              lg: `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'gauges gauges gauges gauges' 'chart chart chart chart'`,
              '3xl': `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'gauges gauges gauges gauges' 'chart chart chart chart'`,
            }}
            templateRows={deviceType === 'solo-node' ? {
              base: 'auto auto',
              lg: 'auto auto',
            } : {
              base: 'auto auto auto auto auto auto',
              lg: 'auto auto auto auto',
            }}
            templateColumns={{
              base: '1fr',
              lg: 'repeat(4, 1fr)',
            }}
            gap={'20px'}
            mb={'10px'}
            transition="all 0.3s ease-in-out"
            width="100%"
            position="relative"
          >
            {deviceType !== 'solo-node' && (
              <GridItem gridArea="hashrate">
                <HashrateCard
                  loading={loadingMiner}
                  errors={errorMiner}
                  data={globalHashrate || { value: 0, unit: 'TH/s' }}
                  avgData={globalAvgHashrate || { value: 0, unit: 'TH/s' }}
                  prevData={prevGlobalHashrate || { value: 0, unit: 'TH/s' }}
                  prevAvgData={
                    prevGlobalAvgHashrate || { value: 0, unit: 'TH/s' }
                  }
                  shadow={shadow}
                  iconColor={iconColor}
                  status={servicesStatus?.miner?.status}
                />
              </GridItem>
            )}

            {deviceType !== 'solo-node' && (
              <GridItem gridArea="chart">
                <Card bgColor={cardColor} boxShadow={shadow} py="15px" pb="30px">
                  <Flex m="2">
                    <Text fontSize="lg" fontWeight="800">
                      <FormattedMessage
                        id="overview.hashrate.title"
                        defaultMessage="Last 24h Hashrate"
                      />
                    </Text>
                  </Flex>
                  <Flex
                    my="auto"
                    align={{ base: 'center', xl: 'start' }}
                    justify={{ base: 'center', xl: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <HashrateChart
                      dataAnalytics={
                        dataAnalytics && Array.isArray(dataAnalytics)
                          ? dataAnalytics
                          : null
                      }
                      loading={loadingAnalytics}
                    />
                  </Flex>
                </Card>
              </GridItem>
            )}

            {deviceType !== 'solo-node' && (
              <GridItem gridArea="temperatures">
                <Card py="15px" bgColor={cardColor} h="100%" boxShadow={shadow}>
                  <Flex direction="column" my="auto">
                    {loadingMiner ? (
                      <BulletList />
                    ) : (
                      <>
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
                                  as={MinerTempIcon}
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage
                              id="overview.temperatures.miner"
                              defaultMessage="Miner temperature"
                            />
                          }
                          value={
                            <span
                              className={
                                avgBoardTemp !== prevAvgBoardTemp &&
                                servicesStatus?.miner?.status === 'online'
                                  ? 'animate__animated animate__flash'
                                  : undefined
                              }
                            >
                              {servicesStatus?.miner?.status === 'online' &&
                              avgBoardTemp !== null
                                ? `${formatTemperature(
                                    avgBoardTemp,
                                    temperatureUnit
                                  )}`
                                : 'N/A'}
                            </span>
                          }
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
                                  as={McuTempIcon}
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage
                              id="overview.temperatures.system"
                              defaultMessage="System temperature"
                            />
                          }
                          value={
                            typeof mcuTemperature !== 'undefined' &&
                            mcuTemperature !== null
                              ? `${formatTemperature(
                                  Math.round(mcuTemperature / 1000),
                                  temperatureUnit
                                )} `
                              : 'N/A'
                          }
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
                                  as={BugIcon}
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage
                              id="overview.temperatures.hardware_errors"
                              defaultMessage="Hardware errors"
                            />
                          }
                          value={
                            <span
                              className={
                                avgBoardErrors !== prevAvgBoardErrors
                                  ? 'animate__animated animate__flash'
                                  : undefined
                              }
                            >
                              {servicesStatus?.miner?.status === 'online' &&
                              avgBoardErrors !== null
                                ? `${avgBoardErrors}%`
                                : 'N/A'}
                            </span>
                          }
                        />
                      </>
                    )}
                  </Flex>
                </Card>
              </GridItem>
            )}

            {deviceType !== 'solo-node' && (
              <GridItem gridArea="power">
                <PowerCard
                  loading={loadingMiner}
                  errors={errorMiner}
                  data={minerPower || 0}
                  avgData={wattsPerTh || 0}
                  prevData={prevMinerPower || 0}
                  prevAvgData={prevWattsPerTh || 0}
                  shadow={shadow}
                  iconColor={iconColor}
                  serviceStatus={servicesStatus}
                />
              </GridItem>
            )}

            <GridItem gridArea="node">
              <Card py="15px" pb="30px" bgColor={cardColor} boxShadow={shadow}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    <FormattedMessage
                      id="overview.node.title"
                      defaultMessage="Node status"
                    />
                  </Text>
                </Flex>
                {nodeStatus === 'pending' ? (
                  <Flex
                    my="auto"
                    align="center"
                    justify="center"
                    direction="row"
                  >
                    <IconBox
                      w="56px"
                      h="56px"
                      icon={
                        nodeStatus === 'pending' ? (
                          <Spinner
                            size="lg"
                            thickness="4px"
                            color="brand.500"
                          />
                        ) : (
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdOfflineBolt}
                            color="red.500"
                          />
                        )
                      }
                      mr="4"
                    />
                    <Text fontSize="md" fontWeight="400" color="gray.600">
                      <FormattedMessage
                        id="overview.node.pending"
                        defaultMessage="Pending... Please wait."
                      />
                    </Text>
                  </Flex>
                ) : errorNodeSentence ? (
                  <Alert borderRadius={'10px'} status={errorNodeType}>
                    <AlertIcon />
                    <AlertTitle>{errorNodeType}</AlertTitle>
                    <AlertDescription>{errorNodeSentence}</AlertDescription>
                  </Alert>
                ) : loadingNode ? (
                  <List />
                ) : (
                  <Flex
                    my="auto"
                    align={{ base: 'center', xl: 'start' }}
                    justify={{ base: 'center', xl: 'center' }}
                    direction={{ base: 'column', lg: 'row' }}
                  >
                    <NoCardStatisticsGauge
                      id="nodeConnections"
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={ConnectionsIcons}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={
                        <FormattedMessage
                          id="overview.node.connections"
                          defaultMessage="Connections"
                        />
                      }
                      value={
                        <Flex>
                          <span
                            className={
                              prevConnectionCount !== connectionCount
                                ? 'animate__animated animate__flash'
                                : undefined
                            }
                          >
                            {connectionCount}
                          </span>
                          <Text color="gray.400">
                            /{nodeMaxConnections || 64}
                          </Text>
                        </Flex>
                      }
                      align="start"
                    />
                    <NoCardStatisticsGauge
                      id="nodeBlocks"
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={BlocksIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={
                        <FormattedMessage
                          id="overview.node.blocks"
                          defaultMessage="Blocks"
                        />
                      }
                      value={
                        <span
                          className={
                            prevBlocksCount !== blocksCount
                              ? 'animate__animated animate__flash'
                              : undefined
                          }
                        >
                          {blocksCount
                            ? blocksCount.toLocaleString('en-US', {
                                maximumFractionDigits: 0,
                              })
                            : 'N/A'}
                        </span>
                      }
                      align="start"
                    />
                    <NoCardStatisticsGauge
                      id="nodeBlockchainSize"
                      startContent={
                        <IconBox
                          w="56px"
                          h="56px"
                          icon={
                            <Icon
                              w="32px"
                              h="32px"
                              as={BlockchainIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name={
                        <FormattedMessage
                          id="overview.node.blockchain_size"
                          defaultMessage="Blockchain size"
                        />
                      }
                      value={bytesToSize(sizeOnDisk)}
                      align="start"
                    />
                  </Flex>
                )}
              </Card>
            </GridItem>

            <GridItem gridArea="gauges">
              <Stack
                direction={{ base: 'column', md: 'row' }}
                spacing="20px"
                p="20px"
                borderRadius="2xl"
              >
                <NoCardStatisticsGauge
                  id="minerTemp"
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      icon={
                        <Icon
                          w="32px"
                          h="32px"
                          as={CpuIcon}
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={
                    <FormattedMessage
                      id="overview.system.cpu_usage"
                      defaultMessage="CPU usage"
                    />
                  }
                  value={cpuUsage ? `${cpuUsage.toFixed(0)}%` : 'N/A'}
                  legendValue={`${cpuCores} ${intl.formatMessage({
                    id: 'overview.system.cores',
                  })}`}
                  percent={cpuUsage}
                  gauge={true}
                  loading={loadingMcu}
                  error={errorMcu}
                />

                <NoCardStatisticsGauge
                  id="hwErr"
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      icon={
                        <Icon
                          w="32px"
                          h="32px"
                          as={MemoryIcon}
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={
                    <FormattedMessage
                      id="overview.system.memory_usage"
                      defaultMessage="Memory usage"
                    />
                  }
                  legendValue={`${bytesToSize(
                    memoryUsed * 1024,
                    0
                  )} / ${bytesToSize(memoryTotal * 1024, 0)}`}
                  rawValue={memoryUsed}
                  total={memoryTotal}
                  gauge={true}
                  loading={loadingMcu}
                  error={errorMcu}
                />

                <NoCardStatisticsGauge
                  id="systemTemp"
                  startContent={
                    <IconBox
                      w="56px"
                      h="56px"
                      icon={
                        <Icon
                          w="32px"
                          h="32px"
                          as={DatabaseIcon}
                          color={iconColorReversed}
                        />
                      }
                    />
                  }
                  name={
                    <FormattedMessage
                      id="overview.system.disk_usage"
                      defaultMessage="System disk usage"
                    />
                  }
                  legendValue={`${bytesToSize(
                    diskUsed * 1024,
                    0,
                    false
                  )} / ${bytesToSize(diskTotal * 1024, 0)}`}
                  rawValue={diskUsed}
                  total={diskTotal}
                  gauge={true}
                  loading={loadingMcu}
                  error={errorMcu}
                />
              </Stack>
            </GridItem>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Overview;
