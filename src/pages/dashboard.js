import { useQuery } from '@apollo/client';
import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Text,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
} from '@chakra-ui/react';
import _ from 'lodash';

import React, { useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { BulletList, List } from 'react-content-loader';
import { useSelector } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import TileCard from '../components/UI/TileCard';
import { bytesToSize } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { minerSelector } from '../redux/reselect/miner';
import { mcuSelector } from '../redux/reselect/mcu';
import { MinerIcon } from '../components/UI/icons/MinerIcon';
import { MinerTempIcon } from '../components/UI/Icons/MinerTemp';
import { McuTempIcon } from '../components/UI/Icons/McuTempIcon';
import { BugIcon } from '../components/UI/Icons/BugIcon';
import { PowerIcon } from '../components/UI/Icons/PowerIcon';
import { CpuIcon } from '../components/UI/Icons/CpuIcon';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { MemoryIcon } from '../components/UI/Icons/MemoryIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { FlagIcon } from '../components/UI/Icons/FlagIcon';

const Dashboard = () => {
  const cardColor = useColorModeValue('white', 'blue.700');
  const hashCardColor = useColorModeValue('linear-gradient(135deg, #040406 0%, #4B5381 100%);', 'blue.500');
  const iconColor = useColorModeValue('white', 'brand.500');
  const hashIconBgColor = useColorModeValue('blue.600', 'white');
  const hashSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );
  const powerCardColor = useColorModeValue('linear-gradient(135deg, #485C7B 0%, #080C0C 100%)', 'gray.500');
  const powerIconBgColor = useColorModeValue('gray.600', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  // Miner data
  const {
    loading: loadingMiner,
    data: { stats: dataMiner },
    error: errorMiner,
  } = useSelector(minerSelector);

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
  } = useSelector(mcuSelector);

  const {
    temperature: mcuTemperature,
    cpu: { threads: cpuCores, usedPercent: cpuUsage },
    disks,
    memory,
  } = dataMcu;

  const mcuPrimaryDisk = _.find(disks, { mountPoint: '/' });
  const { used: diskUsed, total: diskTotal } = mcuPrimaryDisk || {};

  const { used: memoryUsed, total: memoryTotal } = memory || {};

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector);

  const { connectionCount, blocksCount, sizeOnDisk } = dataNode;

  // Set Previous state for CountUp component
  const prevData = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataMiner;
    }, process.env.NEXT_PUBLIC_POLLING_TIME);

    return () => clearInterval(intervalId);
  }, [dataMiner]);

  const {
    globalHashrate: prevGlobalHashrate,
    globalHashrate: prevGlobalAvgHashrate,
    minerPower: prevMinerPower,
  } = prevData.current || {};

  return (
    <Box>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData'`}
        gap={'20px'}
        mb={'10px'}
      >
        <GridItem gridArea="Hashrate">
          <TileCard
            className={'banner-hashrate'}
            boxShadow={shadow}
            bgGradient={hashCardColor}
            icon={MinerIcon}
            iconColor={iconColor}
            iconBgColor={hashIconBgColor}
            secondaryTextColor={hashSecondaryColor}
            title="Current hashrate"
            loading={loadingMiner}
            errors={errorMiner}
            mainData={
              <CountUp
                start={prevGlobalHashrate?.value || 0}
                end={globalHashrate?.value}
                duration="1"
                decimals="2"
                suffix={` ${globalHashrate?.unit}`}
              />
            }
            secondaryData={
              <CountUp
                start={prevGlobalAvgHashrate?.value || 0}
                end={globalAvgHashrate?.value}
                duration="1"
                decimals="2"
                suffix={` ${globalAvgHashrate?.unit}`}
              />
            }
            secondaryText="15 minutes average"
          />
        </GridItem>

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
                            bg={'white'}
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={MinerTempIcon}
                                color="brand.500"
                              />
                            }
                          />
                        }
                        name="Miner temperature"
                        value={`${avgBoardTemp}°C`}
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
                                as={McuTempIcon}
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
                                as={BugIcon}
                                color="brand.500"
                              />
                            }
                          />
                        }
                        name="Hardware errors"
                        value={`${avgBoardErrors}%`}
                      />
                    </>
                  )}
                </Flex>
              </Card>
            </GridItem>
            <GridItem>
              <TileCard
                boxShadow={shadow}
                bgGradient={powerCardColor}
                icon={PowerIcon}
                iconColor={iconColor}
                iconBgColor={powerIconBgColor}
                title="Power usage"
                mainData={
                  <CountUp
                    start={prevMinerPower}
                    end={minerPower}
                    duration="1"
                    decimals="0"
                    suffix={` Watt`}
                  />
                }
                loading={loadingMiner}
                errors={errorMiner}
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
                      <Icon w="32px" h="32px" as={CpuIcon} color="brand.500" />
                    }
                  />
                }
                name="CPU usage"
                value={`${cpuUsage}%`}
                legendValue={`${cpuCores} cores`}
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
                      <Icon w="32px" h="32px" as={DatabaseIcon} color="brand.500" />
                    }
                  />
                }
                name="Disk usage"
                legendValue={`${bytesToSize(
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
                        as={MemoryIcon}
                        color="brand.500"
                      />
                    }
                  />
                }
                name="Memory usage"
                legendValue={`${bytesToSize(
                  memoryUsed * 1024,
                  0
                )} / ${bytesToSize(memoryTotal * 1024, 0)}`}
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
              <Card py="15px" pb="30px" bgColor={'white'} boxShadow={shadow}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    Node status
                  </Text>
                </Flex>
                {loadingNode ? (
                  <List />
                ) : errorNode.length ? (
                  <Alert borderRadius={'10px'} status="warning">
                    <AlertIcon />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      {errorNode.map((error, index) => {
                        return (
                          <div key={index}>
                            There was an error getting stats for Node:{' '}
                            <Code>
                              {error.message || error.code || error.toString()}
                            </Code>
                          </div>
                        );
                      })}
                    </AlertDescription>
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
                              as={ConnectionsIcons}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="Connections"
                      value={`${connectionCount} / 32`}
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
                              as={BlocksIcon}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="Blocks"
                      value={blocksCount}
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
                              as={FlagIcon}
                              color="brand.500"
                            />
                          }
                        />
                      }
                      name="uptime"
                      value={bytesToSize(sizeOnDisk)}
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
