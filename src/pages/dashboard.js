import { useQuery } from '@apollo/client';
import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Text,
  Flex,
  Icon,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import _ from 'lodash';

import React, { memo, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import {
  MdLocalFireDepartment,
  MdPower,
  MdWarning,
  MdWatchLater,
  MdMemory,
  MdOutlinePower,
  MdOutlineSignalWifi0Bar,
} from 'react-icons/md';
import { BulletList, List } from 'react-content-loader';
import { useSelector } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import LoadingIcon from '../components/UI/LoadingIcon';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import TileCard from '../components/UI/TileCard';
import { bytesToSize, displayHashrate } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { minerSelector } from '../redux/reselect/miner';
import { mcuSelector } from '../redux/reselect/mcu';

const Dashboard = () => {
  const cardColor = useColorModeValue('white', 'blue.700');
  const hashCardColor = useColorModeValue('blue.900', 'blue.500');
  const iconColor = useColorModeValue('white', 'brand.500');
  const hashIconBgColor = useColorModeValue('blue.600', 'white');
  const hashSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );
  const powerCardColor = useColorModeValue('gray.900', 'gray.500');
  const powerIconBgColor = useColorModeValue('gray.600', 'white');

  // Miner data
  const {
    loading: loadingMiner,
    data: { stats: dataMiner },
    error: errorMiner,
  } = useSelector(minerSelector);

  // Mcu data
  const {
    loading: loadingMcu,
    data: dataMcu,
    error: errorMcu,
  } = useSelector(mcuSelector);

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector);

  // Set Previous state for CountUp component
  const prevData = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataMiner;
    }, process.env.NEXT_PUBLIC_POLLING_TIME);

    return () => clearInterval(intervalId);
  }, [dataMiner]);

  // Miner hashrate
  const globalHashrate = displayHashrate(
    _.sumBy(dataMiner, (hb) => {
      if (hb.status) return hb.hashrateInGh;
      return null;
    }),
    'gh',
    false,
    2,
    true
  );

  const prevGlobalHashrate = displayHashrate(
    _.sumBy(prevData.current, (hb) => {
      if (hb.status) return hb.hashrateInGh;
      return null;
    }),
    'gh',
    false,
    2,
    true
  );

  const globalAvgHashrate = displayHashrate(
    _.sumBy(dataMiner, (hb) => {
      if (hb.status) return hb.avgHashrateInGh;
      return null;
    }),
    'gh',
    false,
    2,
    true
  );

  const prevGlobalAvgHashrate = displayHashrate(
    _.sumBy(prevData.current, (hb) => {
      if (hb.status) return hb.avgHashrateInGh;
      return null;
    }),
    'gh',
    false,
    2,
    true
  );

  // Miner watt
  const minerPower =
    _.chain(dataMiner)
      .filter((hb) => {
        return hb.status;
      })
      .meanBy((hb) => {
        return hb.wattTotal;
      })
      .value() || 0;
  const minerPowerPerGh =
    _.chain(dataMiner)
      .filter((hb) => {
        return hb.status;
      })
      .meanBy((hb) => {
        return hb.wattPerGHs;
      })
      .value() || 0;

  const avgHashboardTemp = _.meanBy(dataMiner, (hb) => {
    if (hb.status) return hb.temperature;
    return null;
  });

  const avgHashboardErrors = _.chain(dataMiner)
    .filter((hb) => {
      return hb.status;
    })
    .meanBy((hb) => {
      return hb.errorRate;
    })
    .value();

  // Mcu stats
  const {
    temperature: mcuTemperature,
    cpu: { threads: cpuCores, usedPercent: cpuUsage },
    disks,
    memory,
  } = dataMcu;

  const mcuPrimaryDisk = _.find(disks, { mountPoint: '/' });
  const { used: diskUsed, total: diskTotal } = mcuPrimaryDisk || {};

  const { used: memoryUsed, total: memoryTotal } = memory || {};

  // Node stats
  const {
    error: { code: errorCodeNode },
    connectionCount,
  } = dataNode;

  return (
    <Box>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData'`}
        gap={'20px'}
        mb={'10px'}
      >
        <Grid gridArea="Hashrate">
          <GridItem>
            <TileCard
              cardColor={hashCardColor}
              icon={MdLocalFireDepartment}
              iconColor={iconColor}
              iconBgColor={hashIconBgColor}
              secondaryTextColor={hashSecondaryColor}
              title="Current hashrate"
              loading={loadingMiner}
              mainData={
                <CountUp
                  start={prevGlobalHashrate.value}
                  end={globalHashrate.value}
                  duration="1"
                  decimals="2"
                  separator={' '}
                  suffix={` ${globalHashrate.unit}`}
                />
              }
              secondaryData={
                <CountUp
                  start={prevGlobalAvgHashrate.value}
                  end={globalAvgHashrate.value}
                  duration="1"
                  decimals="2"
                  separator={' '}
                  suffix={` ${globalAvgHashrate.unit}`}
                />
              }
              secondaryText="15 minutes average"
            />
          </GridItem>
        </Grid>
        <Grid
          gridArea="MainData"
          templateRows="auto auto auto"
          templateColumns={{ base: 'repeat(1, 1fr)' }}
          templateAreas={{
            base: `'Top' 'Middle' 'Bottom'`,
          }}
          gap={'20px'}
        >
          {/* TOP */}
          <Grid
            gridArea="Top"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: 'repeat(2, 1fr)' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
              <Card py="15px" bgColor={cardColor} h="100%">
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
                            bg={'white'}
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={MdWatchLater}
                                color="brand.500"
                              />
                            }
                          />
                        }
                        name="Miner temperature"
                        value={`${avgHashboardTemp}°C`}
                      />
                      <NoCardStatistics
                        startContent={
                          <IconBox
                            w="56px"
                            h="56px"
                            bg={'white'}
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={MdMemory}
                                color="brand.500"
                              />
                            }
                          />
                        }
                        name="System temperature"
                        value={`${Math.round(mcuTemperature / 1000)}°C`}
                      />
                      <NoCardStatistics
                        startContent={
                          <IconBox
                            w="56px"
                            h="56px"
                            bg={'white'}
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={MdWarning}
                                color="brand.500"
                              />
                            }
                          />
                        }
                        name="Hardware errors"
                        value={`${avgHashboardErrors}%`}
                      />
                    </>
                  )}
                </Flex>
              </Card>
            </GridItem>
            <GridItem>
              <TileCard
                cardColor={powerCardColor}
                icon={MdPower}
                iconColor={iconColor}
                iconBgColor={powerIconBgColor}
                title="Power usage"
                mainData={
                  <CountUp
                    end={minerPower}
                    duration="1"
                    decimals="0"
                    suffix={` Watt`}
                  />
                }
                loading={loadingMiner}
              />
            </GridItem>
          </Grid>

          {/* MIDDLE */}
          <Grid
            gridArea="Middle"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: 'repeat(3, 1fr)' }}
            templateAreas={{
              base: `'. . .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
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
                        as={MdWatchLater}
                        color="brand.500"
                      />
                    }
                  />
                }
                name="CPU usage"
                value={`${cpuUsage}%`}
                percent={cpuUsage}
                gauge={true}
                loading={loadingMcu}
              />
            </GridItem>
            <GridItem>
              <NoCardStatisticsGauge
                id="systemTemp"
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon w="32px" h="32px" as={MdMemory} color="brand.500" />
                    }
                  />
                }
                name="Disk usage"
                value={`${bytesToSize(
                  diskUsed * 1024,
                  0,
                  false
                )} / ${bytesToSize(diskTotal * 1024, 0)}`}
                rawValue={diskUsed}
                total={diskTotal}
                gauge={true}
                loading={loadingMcu}
              />
            </GridItem>
            <GridItem>
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
                        as={MdWarning}
                        color="brand.500"
                      />
                    }
                  />
                }
                name="Memory usage"
                value={`${bytesToSize(
                  memoryUsed * 1024,
                  1,
                  false
                )} / ${bytesToSize(memoryTotal * 1024, 1)}`}
                rawValue={memoryUsed}
                total={memoryTotal}
                gauge={true}
                loading={loadingMcu}
              />
            </GridItem>
          </Grid>

          {/* BOTTOM */}
          <Grid gridArea="Bottom">
            <GridItem>
              <Card py="15px" bgColor={'white'}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    Node status
                  </Text>
                </Flex>
                {loadingNode ? (
                  <BulletList />
                ) : errorCodeNode ? (
                  <Alert borderRadius={'10px'} status="warning">
                    <AlertIcon />
                    <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>Can't get stats from Node (error: {errorCodeNode})</AlertDescription>
                  </Alert>
                ) : (
                  <Flex
                    my="auto"
                    align={{ base: 'center', xl: 'start' }}
                    justify={{ base: 'center', xl: 'center' }}
                    direction="row"
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
                              as={MdWatchLater}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="Connections"
                      value="20 / 32"
                      align="start"
                    />
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
                              as={MdWatchLater}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="Blocks"
                      value="2345678"
                      align="start"
                    />
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
                              as={MdWatchLater}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="uptime"
                      value="9 days"
                      align="start"
                    />
                  </Flex>
                )}
              </Card>
            </GridItem>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
