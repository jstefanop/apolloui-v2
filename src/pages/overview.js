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
import { BulletList, List } from 'react-content-loader';
import { useSelector } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import { bytesToSize } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { minerSelector } from '../redux/reselect/miner';
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
import Head from 'next/head';

const Overview = () => {
  const cardColor = useColorModeValue('white', 'brand.800');

  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');

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
        <title>Apollo BTC Overview</title>
      </Head>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData'`}
        gap={'20px'}
        mb={'10px'}
      >
        <GridItem gridArea="Hashrate">
          <HashrateCard
            loading={loadingMiner}
            errors={errorMiner}
            data={globalHashrate}
            avgData={globalAvgHashrate}
            prevData={prevGlobalHashrate}
            prevAvgData={prevGlobalAvgHashrate}
            shadow={shadow}
            iconColor={iconColor}
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
                        name="Miner temperature"
                        value={
                          <span
                            className={
                              avgBoardTemp !== prevAvgBoardTemp ?
                              'animate__animated animate__flash' : undefined
                            }
                          >
                            {avgBoardTemp}°C
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
                        name="System temperature"
                        value={`${Math.round(mcuTemperature / 1000)}°C`}
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
                        name="Hardware errors"
                        value={
                          <span
                            className={
                              avgBoardErrors !== prevAvgBoardErrors ?
                              'animate__animated animate__flash' : undefined
                            }
                          >
                            {avgBoardErrors ? `${avgBoardErrors}%` : '-'}
                          </span>
                        }
                      />
                    </>
                  )}
                </Flex>
              </Card>
            </GridItem>
            <GridItem>
              <PowerCard
                loading={loadingMiner}
                errors={errorMiner}
                data={minerPower}
                prevData={prevMinerPower}
                shadow={shadow}
                iconColor={iconColor}
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
                        as={CpuIcon}
                        color={iconColorReversed}
                      />
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
            <GridItem>
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
                name="System disk usage"
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
          </Grid>

          {/* BOTTOM */}
          <Grid gridArea="Bottom">
            <GridItem>
              <Card py="15px" pb="30px" bgColor={cardColor} boxShadow={shadow}>
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
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Connections"
                      value={
                        <Flex>
                          <span
                            className={
                              prevConnectionCount !== connectionCount ?
                              'animate__animated animate__flash' : undefined
                            }
                          >
                            {connectionCount}
                          </span>
                          <Text color="gray.400">/32</Text>
                        </Flex>
                      }
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
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Blocks"
                      value={
                        <span
                          className={
                            prevBlocksCount !== blocksCount ?
                            'animate__animated animate__flash' : undefined
                          }
                        >
                          {blocksCount}
                        </span>
                      }
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
                              as={BlockchainIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Blockchain size"
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

export default Overview;
