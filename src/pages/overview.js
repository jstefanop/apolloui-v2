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
import React, { useEffect, useRef } from 'react';
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
} from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { minerSelector } from '../redux/reselect/miner';
import { servicesSelector } from '../redux/reselect/services';
import { analyticsSelector } from '../redux/reselect/analytics';
import { mcuSelector } from '../redux/reselect/mcu';
import { MinerTempIcon } from '../components/UI/Icons/MinerTemp';
import { McuTempIcon } from '../components/UI/Icons/McuTempIcon';
import { BugIcon } from '../components/UI/Icons/BugIcon';
import { CpuIcon } from '../components/UI/Icons/CpuIcon';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { MemoryIcon } from '../components/UI/Icons/MemoryIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import HashrateCard from '../components/apollo/HashrateCard';
import PowerCard from '../components/apollo/PowerCard';
import { BlockchainIcon } from '../components/UI/Icons/BlockchainIcon';
import { settingsSelector } from '../redux/reselect/settings';
import HashrateChart from '../components/apollo/HashrateChart';
import { MdOfflineBolt } from 'react-icons/md';

const Overview = () => {
  const intl = useIntl();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  const { data: servicesStatus } = useSelector(servicesSelector, shallowEqual);

  const nodeStatus = servicesStatus?.node?.status;

  // Miner data
  const {
    loading: loadingMiner,
    data: { stats: dataMiner },
    error: errorMiner,
  } = useSelector(minerSelector, shallowEqual);

  const {
    globalHashrate,
    globalAvgHashrate,
    minerPower,
    avgBoardTemp,
    avgBoardErrors,
  } = dataMiner;

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

  // Analytics data
  const {
    loading: loadingAnalytics,
    data: dataAnalytics,
    error: errorAnalytics,
  } = useSelector(analyticsSelector, shallowEqual);

  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode);

  // Settings data
  const { data: settings } = useSelector(settingsSelector, shallowEqual);

  const { nodeMaxConnections, temperatureUnit } = settings || {};

  // Set Previous state for CountUp component
  const prevData = useRef(dataMiner);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataMiner;
    }, process.env.NEXT_PUBLIC_POLLING_TIME);

    return () => clearInterval(intervalId);
  }, [dataMiner]);

  const {
    avgBoardErrors: prevAvgBoardErrors,
    avgBoardTemp: prevAvgBoardTemp,
    globalHashrate: prevGlobalHashrate,
    globalAvgHashrate: prevGlobalAvgHashrate,
    minerPower: prevMinerPower,
  } = prevData.current || {};

  const prevDataNode = useRef(dataNode);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevDataNode.current = dataNode;
    }, process.env.NEXT_PUBLIC_POLLING_TIME_NODE);

    return () => clearInterval(intervalId);
  }, [dataNode]);

  const { connectionCount: prevConnectionCount, blocksCount: prevBlocksCount } =
    prevData.current || {};

  return (
    <Box>
      <Head>
        <title>
          <FormattedMessage id="overview.title" defaultMessage="Apollo Overview" />
        </title>
      </Head>
      {errorNode && errorMcu && !errorMiner ? (
        <Alert borderRadius={'10px'} status="warning">
          <AlertIcon />
          <AlertTitle>
            <FormattedMessage id="overview.warning.title" defaultMessage="Warning" />
          </AlertTitle>
          <AlertDescription>
            <FormattedMessage 
              id="overview.warning.description" 
              defaultMessage="There is a problem getting data from the server."
            />
          </AlertDescription>
        </Alert>
      ) : (
        <Grid
          templateAreas={{
            base: `'hashrate' 'chart' 'temperatures' 'power' 'node' 'gauges'`,
            lg: `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'gauges gauges gauges gauges' 'chart chart chart chart'`,
            '3xl': `'hashrate hashrate temperatures power' 'hashrate hashrate node node' 'hashrate hashrate gauges gauges' 'chart chart chart chart'`,
          }}
          templateRows={{
            base: 'auto auto auto auto auto auto',
            lg: 'auto auto auto auto',
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
              loading={loadingMiner}
              errors={errorMiner}
              data={globalHashrate}
              avgData={globalAvgHashrate}
              prevData={prevGlobalHashrate}
              prevAvgData={prevGlobalAvgHashrate}
              shadow={shadow}
              iconColor={iconColor}
              serviceStatus={servicesStatus}
            />
          </GridItem>

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
                />
              </Flex>
            </Card>
          </GridItem>

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

          <GridItem gridArea="power">
            <PowerCard
              loading={loadingMiner}
              errors={errorMiner}
              data={minerPower}
              prevData={prevMinerPower}
              shadow={shadow}
              iconColor={iconColor}
              serviceStatus={servicesStatus}
            />
          </GridItem>

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
                <Flex my="auto" align="center" justify="center" direction="row">
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      nodeStatus === 'pending' ? (
                        <Spinner size="lg" thickness="4px" color="brand.500" />
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
                legendValue={`${cpuCores} ${intl.formatMessage({ id: 'overview.system.cores' })}`}
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
      )}
    </Box>
  );
};

export default Overview;
