import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Text,
  Flex,
  Stack,
  SimpleGrid,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Select,
  Button,
} from '@chakra-ui/react';
import _ from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import CardSkeleton from '../components/UI/CardSkeleton';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import MiniStatistics from '../components/UI/MiniStatistics';
import ProgressRing from '../components/UI/ProgressRing';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import useNodeStorage from '../hooks/useNodeStorage';
import {
  bytesToSize,
  bytesPairToSize,
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
import HashrateChart, { INTERVAL_CONFIG } from '../components/apollo/HashrateChart';
import MinerMetricsGrid from '../components/apollo/MinerMetricsGrid';
import { MdOfflineBolt, MdPowerSettingsNew, MdPlayArrow } from 'react-icons/md';
import { useLazyQuery } from '@apollo/client';
import { SOLO_START_QUERY } from '../graphql/solo';
import { GiDiamondTrophy } from 'react-icons/gi';
import CountUp from 'react-countup';
import { useDeviceType } from '../contexts/DeviceConfigContext';

const Overview = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  // The theme redefines gray.400 as #E0E5F2, which is a light grey on a white
  // card and all but white on a dark one — so the total next to the value lost
  // its subordinate reading in dark mode. Dim it against the surface instead.
  const totalColor = useColorModeValue('gray.400', 'whiteAlpha.600');
  // The off panel runs against the page: dark on a light theme, light on a dark
  // one. Every other card here shares the page's own background, so a panel
  // that shares it too reads as one more card among them — and this one is the
  // only thing on screen asking to be acted on.
  const offBg = useColorModeValue('brand.500', 'white');
  const offText = useColorModeValue('white', 'brand.800');
  const offMuted = useColorModeValue('whiteAlpha.800', 'secondaryGray.700');
  const offBtnBg = useColorModeValue('white', 'brand.500');
  const offBtnText = useColorModeValue('brand.500', 'white');
  const offBtnHover = useColorModeValue('secondaryGray.300', 'brand.400');
  // The warning dress: the card itself goes orange, and the button keeps the
  // colour the other panels have so the action stays the most contrasted thing
  // on it.
  const warnBtnBg = useColorModeValue('white', 'brand.800');
  const warnBtnText = useColorModeValue('orange.600', 'white');
  const warnBtnHover = useColorModeValue('secondaryGray.300', 'brand.500');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );
  const deviceType = useDeviceType();

  // Chart interval state
  const [chartInterval, setChartInterval] = useState('hour');

  const {
    data: servicesStatus,
    loading: loadingServices,
    error: errorServices,
  } = useSelector(servicesSelector, shallowEqual);

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
  const { data: soloData } = useSelector(soloSelector, shallowEqual);

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

    // Check if there are any connected users (using hasUsers from selector)
    const hasUsers = dataSolo?.hasUsers || false;

    // If no users are connected, return null to show N/A
    if (!hasUsers) return null;

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


  const { storage, loading: loadingStorage } = useNodeStorage();

  // Starting the pool was only ever offered on the Solo page, so the Overview
  // could tell you the thing was off and leave you to go and find the switch.
  const [startSolo, { loading: startingSolo }] = useLazyQuery(SOLO_START_QUERY, {
    fetchPolicy: 'no-cache',
  });

  // The three ways the pool can be anything other than running, told apart once
  // so the card renders one shape instead of three near-identical ones.
  const soloOffState = useMemo(() => {
    const status = servicesStatus?.solo?.status;

    if (status === 'pending') {
      // Which way the transition is going: `pending` alone said "Starting the
      // solo pool" while the user was stopping it.
      const stopping = servicesStatus?.solo?.requestedStatus === 'offline';

      return {
        spinner: true,
        title: stopping ? (
          <FormattedMessage
            id="overview.solo.state.stopping.title"
            defaultMessage="Stopping the solo pool"
          />
        ) : (
          <FormattedMessage
            id="overview.solo.state.starting.title"
            defaultMessage="Starting the solo pool"
          />
        ),
        description: stopping ? (
          <FormattedMessage
            id="overview.solo.state.stopping.description"
            defaultMessage="Anything mining to this device is about to be disconnected."
          />
        ) : (
          <FormattedMessage
            id="overview.solo.state.starting.description"
            defaultMessage="It takes a few seconds before the pool accepts connections."
          />
        ),
      };
    }

    if (status === 'offline') {
      return {
        icon: MdPowerSettingsNew,
        accent: 'orange.400',
        canStart: true,
        title: (
          <FormattedMessage
            id="overview.solo.state.off.title"
            defaultMessage="The solo pool is off"
          />
        ),
        description: (
          <FormattedMessage
            id="overview.solo.state.off.description"
            defaultMessage="Nothing can mine to this device until the pool is running."
          />
        ),
      };
    }

    return {
      icon: MdOfflineBolt,
      iconColor: 'orange.400',
      accent: 'orange.400',
      title: (
        <FormattedMessage
          id="overview.solo.state.unknown.title"
          defaultMessage="Solo pool status unknown"
        />
      ),
      description: (
        <FormattedMessage
          id="overview.solo.state.unknown.description"
          defaultMessage="The device has not reported whether the pool is running."
        />
      ),
    };
  }, [servicesStatus?.solo?.status, servicesStatus?.solo?.requestedStatus]);

  // `available` on NodeStorage is a boolean, not a number of bytes, and `size`
  // and `free` arrive as strings — so the arithmetic is done once, here, rather
  // than inline where a stray `available` would read as 1 byte.
  const nodeDisk = useMemo(() => {
    const size = storage?.size != null ? Number(storage.size) : null;
    const free = storage?.free != null ? Number(storage.free) : null;
    const usable = Number.isFinite(size) && Number.isFinite(free) && size > 0;
    return {
      size: Number.isFinite(size) ? size : null,
      free: Number.isFinite(free) ? free : null,
      used: usable ? size - free : null,
      // The ring fills as the drive fills, not as it empties: a full circle has
      // to mean "no room left", whatever the label beside it counts.
      percentUsed: usable ? ((size - free) / size) * 100 : 0,
    };
  }, [storage]);

  // Both figures in one unit: formatted separately, 500 GB free on a 4 TB drive
  // reads "500/4 TB".
  const diskPair = useMemo(
    () => bytesPairToSize(nodeDisk.free, nodeDisk.size),
    [nodeDisk]
  );
  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode, intl, storage);

  // Settings data
  const { data: settings } = useSelector(settingsSelector, shallowEqual);

  const { nodeMaxConnections, temperatureUnit, nodeEnableSoloMining } = settings || {};

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
  // ?? not ||: globalHashrate is a { value, unit } object, so a value of 0 —
  // which is exactly what a miner reports right after it restarts — is falsy and
  // used to fall through to the object itself, dividing watts by an object.
  const wattsPerTh = calculateWattsPerTh(
    minerPower?.value ?? minerPower ?? 0,
    globalHashrate?.value ?? globalHashrate ?? 0
  );
  const prevWattsPerTh = calculateWattsPerTh(
    prevMinerPower?.value ?? prevMinerPower ?? 0,
    prevGlobalHashrate?.value ?? prevGlobalHashrate ?? 0
  );


  const soloOnline = servicesStatus?.solo?.status === 'online';

  // Lifted out of the row above: on a solo node it now sits beside the
  // chart, and it would otherwise have to be written twice.
  // Orange only where orange is true. "Starting" is not a warning — it is the
  // second after someone pressed the button — so it keeps the inverted blue and
  // says nothing alarming while it waits.
  const soloWarn = !!soloOffState.accent;
  const panelBg = soloWarn ? 'orange.400' : offBg;
  const panelText = soloWarn ? 'white' : offText;
  const panelMuted = soloWarn ? 'whiteAlpha.900' : offMuted;

  const soloOffPanel = (cardProps = {}) => (
      <Card
        bgColor={panelBg}
        boxShadow={shadow}
        py="34px"
        width="100%"
        maxWidth="100%"
        overflow="hidden"
        {...cardProps}
      >
        {/* What used to be here was a red bolt and a flat sentence on an
            otherwise empty band, with nothing to do about it. The pool
            being off is a state, not a fault: it gets a plain icon, a
            reason, and the switch that until now lived only on the Solo
            page. */}
        {/* Gated on the services slice, which is what this panel renders.
            Gating on the solo slice looked equivalent and is not: the two
            arrive on separate WebSocket topics, so when the solo push lands
            first `loadingSolo` is already false while the service status is
            still undefined — and the panel fell through to the orange "status
            unknown" warning instead of a skeleton. A services error did the
            same, since that selector nulls its own data and leaves `errorSolo`
            empty. */}
        {loadingServices && !servicesStatus?.solo?.status ? (
          <Flex height="100%" align="center" px="20px">
            <CardSkeleton lines={2} />
          </Flex>
        ) : errorServices && errorServices.length > 0 ? (
          <Alert borderRadius={'10px'} status="error">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorServices.map((err, idx) => (
                <div key={idx}>
                  {typeof err === 'string'
                    ? err
                    : err?.message || err?.code || 'Unknown error'}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            px="6"
            gap="3"
          >
            <IconBox
              w="72px"
              h="72px"
              bg="transparent"
              icon={
                soloOffState.spinner ? (
                  <Spinner size="lg" thickness="4px" color={panelText} />
                ) : (
                  <Icon
                    w="40px"
                    h="40px"
                    as={soloOffState.icon}
                    color={soloWarn ? panelText : offMuted}
                  />
                )
              }
            />
            <Text fontSize="2xl" fontWeight="800" color={panelText}>
              {soloOffState.title}
            </Text>
            <Text fontSize="md" color={panelMuted} maxW="460px">
              {soloOffState.description}
            </Text>
            {soloOffState.canStart && (
              <Button
                mt="2"
                size="md"
                bg={soloWarn ? warnBtnBg : offBtnBg}
                color={soloWarn ? warnBtnText : offBtnText}
                _hover={{ bg: soloWarn ? warnBtnHover : offBtnHover }}
                _active={{ bg: soloWarn ? warnBtnHover : offBtnHover }}
                leftIcon={<Icon as={MdPlayArrow} w="20px" h="20px" />}
                isLoading={startingSolo}
                onClick={() => startSolo()}
              >
                <FormattedMessage
                  id="overview.solo.start"
                  defaultMessage="Start solo pool"
                />
              </Button>
            )}
          </Flex>
        )}
      </Card>
  );

  return (
    <Box
      width="100%"
      maxWidth="100%"
      overflowX="hidden"
    >
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
          {(deviceType === 'solo-node' || nodeEnableSoloMining === true) && (
            <>
              {/* The cards stay up when the pool is off — dimmed, not taken
                  away. The record lives in the database now, so Best share
                  still has something true to show with ckpool stopped, and a
                  row that vanishes costs the reader the layout they had a
                  moment ago. */}
              <Box
                opacity={soloOnline ? 1 : 0.45}
                filter={soloOnline ? undefined : 'grayscale(0.65)'}
                pointerEvents={soloOnline ? undefined : 'none'}
                transition="opacity 0.25s ease, filter 0.25s ease"
              >
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
                  base: 'minmax(0, 1fr)',
                  lg: 'repeat(3, minmax(0, 1fr))',
                }}
                gap={'20px'}
                mb={'20px'}
                transition="all 0.3s ease-in-out"
                width="100%"
                maxWidth="100%"
                position="relative"
                overflowX="hidden"
              >
                <GridItem gridArea="soloHashrate" minW={0}>
                  <Card
                    bgColor={cardColor}
                    boxShadow={shadow}
                    py="15px"
                    pb="30px"
                    height="100%"
                    width="100%"
                    maxWidth="100%"
                    overflow="hidden"
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
                              end={soloKPI.hashrate}
                              duration={1.5}
                              separator=","
                              decimals={2}
                              suffix={` ${soloKPI.hashrateUnit || ''}`}
                              preserveValue
                            />
                          ) : (
                            'N/A'
                          )}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </GridItem>

                <GridItem gridArea="soloBestShare" minW={0}>
                  <Card
                    bgColor={cardColor}
                    boxShadow={shadow}
                    py="15px"
                    pb="30px"
                    height="100%"
                    width="100%"
                    maxWidth="100%"
                    overflow="hidden"
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
                        {/* Deliberately outside soloKPI: that one is null
                            whenever no worker is connected, and the record does
                            not stop existing because nobody is mining. */}
                        <Text fontSize="xs" fontWeight="600" color="gray.500">
                          <FormattedMessage
                            id="solo_mining.stats.best_share_ever"
                            defaultMessage="Best share ever"
                          />
                          {': '}
                          {dataSolo?.bestShareEver?.value
                            ? numberToText(dataSolo.bestShareEver.value, intl)
                            : 'N/A'}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </GridItem>

                <GridItem gridArea="soloDailyChance" minW={0}>
                  <Card
                    bgColor={cardColor}
                    boxShadow={shadow}
                    py="15px"
                    pb="30px"
                    height="100%"
                    width="100%"
                    maxWidth="100%"
                    overflow="hidden"
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
                              end={soloKPI?.dailyChance || 0}
                              duration={2}
                              separator=","
                              decimals={0}
                              suffix=""
                              prefix="1 in "
                              preserveValue
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
              </Box>

              {/* A solo node puts this beside its chart, below. No other
                  device type has a soloChart for it to sit next to. */}
              {!soloOnline &&
                deviceType !== 'solo-node' &&
                soloOffPanel({ mb: '20px' })}
          </>
          )}

          <Grid
            templateAreas={deviceType === 'solo-node' ? (soloOnline ? {
              base: `'node' 'soloChart' 'gauges'`,
              lg: `'node node node node' 'soloChart soloChart soloChart soloChart' 'gauges gauges gauges gauges'`,
              '3xl': `'node node node node' 'soloChart soloChart soloChart soloChart' 'gauges gauges gauges gauges'`,
            } : {
              // The chart gives up a quarter of the row to the panel rather
              // than the panel taking a full-width band of its own. On the left,
              // where the reading starts: stacked, it already comes first.
              base: `'node' 'soloState' 'soloChart' 'gauges'`,
              lg: `'node node node node' 'soloState soloChart soloChart soloChart' 'gauges gauges gauges gauges'`,
              '3xl': `'node node node node' 'soloState soloChart soloChart soloChart' 'gauges gauges gauges gauges'`,
            }) : {
              base: `'hashrate' 'temperatures' 'power' 'node' 'chart' 'gauges'`,
              lg: `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'chart chart chart chart' 'gauges gauges gauges gauges'`,
              '3xl': `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'chart chart chart chart' 'gauges gauges gauges gauges'`,
            }}
            templateRows={deviceType === 'solo-node' ? {
              base: soloOnline ? 'auto auto auto' : 'auto auto auto auto',
              lg: 'auto auto auto',
            } : {
              base: 'auto auto auto auto auto auto',
              lg: 'auto auto auto auto',
            }}
            templateColumns={{
              base: 'minmax(0, 1fr)',
              lg: 'repeat(4, minmax(0, 1fr))',
            }}
            gap={'20px'}
            mb={'10px'}
            transition="all 0.3s ease-in-out"
            width="100%"
            maxWidth="100%"
            position="relative"
            overflowX="hidden"
          >
            {deviceType !== 'solo-node' && (
              <GridItem gridArea="hashrate" minW={0}>
                <HashrateCard
                  loading={loadingMiner}
                  errors={errorMiner}
                  data={globalHashrate || { value: 0, unit: 'TH/s' }}
                  avgData={globalAvgHashrate || { value: 0, unit: 'TH/s' }}
                  shadow={shadow}
                  iconColor={iconColor}
                  status={servicesStatus?.miner?.status}
                />
              </GridItem>
            )}

            {deviceType !== 'solo-node' && (
              <GridItem gridArea="chart" minW={0}>
                {/* Interval selector row */}
                <Flex mb={3} justify="space-between" align="center" px={1}>
                  <Text fontSize="lg" fontWeight="800">
                    <FormattedMessage
                      id="overview.hashrate.chart.title"
                      defaultMessage="Miner Metrics"
                    />
                  </Text>
                  <Select
                    size="sm"
                    value={chartInterval}
                    onChange={(e) => setChartInterval(e.target.value)}
                    w="auto"
                    minW="130px"
                    fontSize="xs"
                    fontWeight="500"
                    borderRadius="md"
                    bg="transparent"
                    borderColor={iconColorReversed}
                    color={iconColorReversed}
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                    cursor="pointer"
                  >
                    <option value="tenmin" style={{ color: 'black' }}>
                      {intl.formatMessage({ id: 'chart.interval.6hours', defaultMessage: 'Last 6 hours' })}
                    </option>
                    <option value="hour" style={{ color: 'black' }}>
                      {intl.formatMessage({ id: 'chart.interval.24hours', defaultMessage: 'Last 24 hours' })}
                    </option>
                    <option value="day" style={{ color: 'black' }}>
                      {intl.formatMessage({ id: 'chart.interval.30days', defaultMessage: 'Last 30 days' })}
                    </option>
                  </Select>
                </Flex>
                {/* 2×2 mini charts — each card is standalone */}
                <MinerMetricsGrid
                  interval={chartInterval}
                  currentHashrate={globalHashrate}
                  currentTemp={avgBoardTemp}
                  currentPower={minerPower}
                />
              </GridItem>
            )}

            {deviceType === 'solo-node' && !soloOnline && (
              <GridItem gridArea="soloState" minW={0}>
                {/* Fills the row beside the chart; the grid supplies the gap
                    that the standalone band has to carry itself. */}
                {soloOffPanel({ h: '100%', display: 'flex', justifyContent: 'center' })}
              </GridItem>
            )}

            {deviceType === 'solo-node' && (
              <GridItem gridArea="soloChart" minW={0}>
                <Card bgColor={cardColor} boxShadow={shadow} py="15px" pb="30px" width="100%" maxWidth="100%" overflow="hidden">
                  <Flex m="2" justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="800">
                      <FormattedMessage
                        id="overview.solo.hashrate.chart.title"
                        defaultMessage="Solo Hashrate History"
                      />
                    </Text>
                    <Select
                      size="sm"
                      value={chartInterval}
                      onChange={(e) => setChartInterval(e.target.value)}
                      w="auto"
                      minW="130px"
                      fontSize="xs"
                      fontWeight="500"
                      borderRadius="md"
                      bg="transparent"
                      borderColor={iconColorReversed}
                      color={iconColorReversed}
                      _hover={{ borderColor: 'orange.500' }}
                      _focus={{ borderColor: 'orange.500', boxShadow: 'none' }}
                      cursor="pointer"
                    >
                      <option value="tenmin" style={{ color: 'black' }}>
                        {intl.formatMessage({ id: 'chart.interval.6hours', defaultMessage: 'Last 6 hours' })}
                      </option>
                      <option value="hour" style={{ color: 'black' }}>
                        {intl.formatMessage({ id: 'chart.interval.24hours', defaultMessage: 'Last 24 hours' })}
                      </option>
                      <option value="day" style={{ color: 'black' }}>
                        {intl.formatMessage({ id: 'chart.interval.30days', defaultMessage: 'Last 30 days' })}
                      </option>
                    </Select>
                  </Flex>
                  <Flex
                    my="auto"
                    align={{ base: 'center', xl: 'start' }}
                    justify={{ base: 'center', xl: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <HashrateChart source="solo" interval={chartInterval} />
                  </Flex>
                </Card>
              </GridItem>
            )}

            {deviceType !== 'solo-node' && (
              <GridItem gridArea="temperatures" minW={0}>
                <Card py="15px" bgColor={cardColor} h="100%" boxShadow={shadow} width="100%" maxWidth="100%" overflow="hidden">
                  <Flex direction="column" my="auto">
                    {loadingMiner ? (
                      <Stack spacing={5} px="20px" py="10px">
                        <CardSkeleton lines={2} iconSize="40px" />
                        <CardSkeleton lines={2} iconSize="40px" />
                        <CardSkeleton lines={2} iconSize="40px" />
                      </Stack>
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
                              Number.isFinite(avgBoardTemp)
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
                              Number.isFinite(avgBoardErrors)
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
              <GridItem gridArea="power" minW={0}>
                <PowerCard
                  loading={loadingMiner}
                  errors={errorMiner}
                  data={minerPower || 0}
                  avgData={wattsPerTh || 0}
                  shadow={shadow}
                  iconColor={iconColor}
                  serviceStatus={servicesStatus}
                />
              </GridItem>
            )}

            <GridItem gridArea="node" minW={0}>
              {deviceType === 'solo-node' ? (
                /* Four standalone widgets instead of one panel with a heading.
                   On a solo node these are the device's headline numbers, and a
                   "Node status" title above them only repeated what each label
                   already said. The disk is here rather than on the System page
                   because a solo node that runs out of room stops being a node. */
                <>
                  {/* The one thing the widgets cannot say. getNodeErrorMessage
                      turns an unreachable RPC or a missing drive into an
                      instruction, and without it a bitcoind that will not start
                      shows "0/64", "N/A", "N/A" and no reason — on the device
                      where the node is the whole product. The page-level
                      fallback does not cover it: that one needs the MCU to be
                      failing too. */}
                  {errorNodeSentence && (
                    <Alert borderRadius={'10px'} status={errorNodeType} mb="20px">
                      <AlertIcon />
                      <AlertTitle>{errorNodeType}</AlertTitle>
                      <AlertDescription>{errorNodeSentence}</AlertDescription>
                    </Alert>
                  )}
                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="20px">
                  <MiniStatistics
                    bgColor={cardColor}
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg="transparent"
                        icon={<Icon w="32px" h="32px" as={ConnectionsIcons} color={iconColorReversed} />}
                      />
                    }
                    name={
                      <FormattedMessage
                        id="node.widget.connections"
                        defaultMessage="Node Connections"
                      />
                    }
                    value={
                      <Flex>
                        <span>{connectionCount ?? 0}</span>
                        <Text color={totalColor}>/{nodeMaxConnections || 64}</Text>
                      </Flex>
                    }
                    loading={loadingNode}
                  />

                  <MiniStatistics
                    bgColor={cardColor}
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg="transparent"
                        icon={<Icon w="32px" h="32px" as={BlocksIcon} color={iconColorReversed} />}
                      />
                    }
                    name={
                      <FormattedMessage
                        id="node.widget.current_block"
                        defaultMessage="Node Current Block"
                      />
                    }
                    value={
                      blocksCount
                        ? blocksCount.toLocaleString('en-US', { maximumFractionDigits: 0 })
                        : 'N/A'
                    }
                    loading={loadingNode}
                  />

                  <MiniStatistics
                    bgColor={cardColor}
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg="transparent"
                        icon={<Icon w="32px" h="32px" as={BlockchainIcon} color={iconColorReversed} />}
                      />
                    }
                    name={
                      <FormattedMessage
                        id="node.widget.blockchain_size"
                        defaultMessage="Blockchain Size"
                      />
                    }
                    value={sizeOnDisk ? bytesToSize(sizeOnDisk) : 'N/A'}
                    loading={loadingNode}
                  />

                  <MiniStatistics
                    bgColor={cardColor}
                    startContent={
                      /* The proportion goes in the icon slot rather than in a
                         bar below the value: a bar needs its own row, and the
                         one card in four that grew taller was the first thing
                         the eye landed on. Red once the device itself says the
                         drive is low — the same flag the storage panel reads,
                         not a threshold invented here. */
                      <ProgressRing
                        percent={nodeDisk.percentUsed}
                        color={storage?.low ? 'red.500' : undefined}
                      >
                        <Icon w="24px" h="24px" as={DatabaseIcon} color={iconColorReversed} />
                      </ProgressRing>
                    }
                    name={
                      <FormattedMessage
                        id="node.widget.disk_free"
                        defaultMessage="Node Disk Free"
                      />
                    }
                    value={
                      diskPair ? (
                        <Flex>
                          <span>{diskPair.part}</span>
                          <Text color={totalColor}>/{diskPair.total}</Text>
                        </Flex>
                      ) : (
                        'N/A'
                      )
                    }
                    loading={loadingStorage}
                  />
                </SimpleGrid>
                </>
              ) : (
                <Card py="15px" pb="30px" bgColor={cardColor} boxShadow={shadow} width="100%" maxWidth="100%" overflow="hidden">
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
                    <Flex px="20px" py="10px" gap={10} wrap="wrap">
                      <CardSkeleton lines={2} />
                      <CardSkeleton lines={2} />
                      <CardSkeleton lines={2} />
                    </Flex>
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
                            <Text color={totalColor}>
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
              )}
            </GridItem>

            <GridItem gridArea="gauges" minW={0}>
              <Card bgColor={cardColor} boxShadow={shadow} py="15px" width="100%" maxWidth="100%" overflow="hidden">
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    <FormattedMessage
                      id="overview.system.title"
                      defaultMessage="System"
                    />
                  </Text>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px">
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
                      value={cpuUsage !== null && cpuUsage !== undefined ? `${cpuUsage}%` : 'N/A'}
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
                </SimpleGrid>
              </Card>
            </GridItem>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Overview;
