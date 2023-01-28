import {
  Box,
  Icon,
  Flex,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRef, useEffect } from 'react';
import { BulletList, List } from 'react-content-loader';
import { useSelector } from 'react-redux';

import IconBox from '../components/icons/IconBox';
import Card from '../components/card/Card';
import { minerSelector } from '../redux/reselect/miner';
import HashrateCard from '../components/apollo/HashrateCard';
import PowerCard from '../components/apollo/PowerCard';
import MiniStatistics from '../components/UI/MiniStatistics';
import { BugIcon } from '../components/UI/Icons/BugIcon';
import { RejectedIcon } from '../components/UI/Icons/RejectedIcon';
import { LastShareIcon } from '../components/UI/Icons/LastShareIcon';
import { PowerOffSolidIcon } from '../components/UI/Icons/PowerOffSolidIcon';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import { MinerTempIcon } from '../components/UI/Icons/MinerTemp';
import { FanIcon } from '../components/UI/Icons/FanIcon';

const Miner = () => {
  const cardColor = useColorModeValue('white', 'blue.700');
  const iconColor = useColorModeValue('white', 'brand.500');
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
    globalAvgHashrate: prevGlobalAvgHashrate,
    minerPower: prevMinerPower,
  } = prevData.current || {};

  const {
    globalHashrate,
    globalAvgHashrate,
    minerPower,
    minerPowerPerGh,
    avgBoardTemp,
    avgBoardErrors,
    avgBoardRejected,
    avgChipSpeed,
    avgFanSpeed,
    lastShareTime,
    minerUptime,
  } = dataMiner;

  return (
    <Box>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Main Main Data Data Data Data' 'Main Main Data Data Data Data' 'Main Main Data Data Data Data'`}
        gap={'20px'}
        mb={'10px'}
      >
        <Grid
          gridArea="Main"
          templateRows="repeat(2, 1fr)"
          templateColumns={{ base: 'repeat(1, 1fr)' }}
          templateAreas={`'Hashrate' 'Power'`}
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

          <GridItem gridArea="Power">
            <PowerCard
              loading={loadingMiner}
              errors={errorMiner}
              data={minerPower}
              avgData={minerPowerPerGh}
              prevAvgData={prevMinerPower}
              shadow={shadow}
              iconColor={iconColor}
            />
          </GridItem>
        </Grid>

        <Grid
          gridArea="Data"
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
            templateColumns={{ base: 'repeat(4, 1fr)' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'white'}
                    icon={
                      <BugIcon w="32px" h="32px" color={iconColorReversed} />
                    }
                  />
                }
                name="Hardware errors"
                value={`${avgBoardErrors}%`}
                reversed={true}
              />
            </GridItem>
            <GridItem>
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'white'}
                    icon={
                      <RejectedIcon
                        w="32px"
                        h="32px"
                        color={iconColorReversed}
                      />
                    }
                  />
                }
                name="Rejected"
                value={avgBoardRejected}
                reversed={true}
              />
            </GridItem>
            <GridItem>
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'white'}
                    icon={
                      <LastShareIcon
                        w="32px"
                        h="32px"
                        color={iconColorReversed}
                      />
                    }
                  />
                }
                name="Last share"
                value={lastShareTime.replace('a few', '')}
                fontSize={'xl'}
                reversed={true}
              />
            </GridItem>
            <GridItem>
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'white'}
                    icon={
                      <PowerOffSolidIcon
                        w="32px"
                        h="32px"
                        color={iconColorReversed}
                      />
                    }
                  />
                }
                name="Uptime"
                value={minerUptime}
                reversed={true}
              />
            </GridItem>
          </Grid>

          {/* MIDDLE */}
          <Grid
            gridArea="Middle"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: 'auto 1fr' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
              <Card py="15px" pb="30px" pr="40px" bgColor={cardColor} boxShadow={shadow}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    Device presets
                  </Text>
                </Flex>
                {loadingMiner ? (
                  <BulletList />
                ) : (
                  <Flex my="auto" direction="column">
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
                              as={PowerOffSolidIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Miner mode"
                      value={`TURBO`}
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
                              as={PowerOffSolidIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Power management"
                      value={`AUTO`}
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
                              as={PowerOffSolidIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Frequency"
                      value={`AUTO`}
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
                              as={PowerOffSolidIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Fan management"
                      value={`AUTO`}
                      reversed={true}
                    />
                  </Flex>
                )}
              </Card>
            </GridItem>
            <GridItem>
              <Card py="15px" pb="30px" bgColor={cardColor} boxShadow={shadow}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    Average pools and hashboards
                  </Text>
                </Flex>
                {loadingMiner ? (
                  <BulletList />
                ) : (
                  <Flex my="auto" direction="column"></Flex>
                )}
              </Card>
            </GridItem>
          </Grid>

          {/* BOTTOM */}
          <Card bgColor={cardColor} boxShadow={shadow}>
            <Flex m="2">
              <Text fontSize="lg" fontWeight="800">
                Boards averages
              </Text>
            </Flex>
            {loadingMiner ? (
              <List />
            ) : (
              <Grid
                gridArea="Bottom"
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
                            as={MinerTempIcon}
                            color={iconColorReversed}
                          />
                        }
                      />
                    }
                    name="Miner temperature"
                    value={`${avgBoardTemp}°C`}
                    rawValue={avgBoardTemp}
                    legendValue={'On the average'}
                    total="100"
                    gauge={true}
                    loading={loadingMiner}
                  />
                </GridItem>
                <GridItem>
                  <NoCardStatisticsGauge
                    id="chipSpeed"
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={PowerOffSolidIcon}
                            color={iconColorReversed}
                          />
                        }
                      />
                    }
                    name="Chip speed"
                    value={avgChipSpeed}
                    rawValue={avgChipSpeed}
                    total={100}
                    gauge={true}
                    loading={loadingMiner}
                  />
                </GridItem>
                <GridItem>
                  <NoCardStatisticsGauge
                    id="fanSpeed"
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={FanIcon}
                            color={iconColorReversed}
                          />
                        }
                      />
                    }
                    name="Fan speed"
                    value={`${avgFanSpeed} rpm`}
                    rawValue={avgFanSpeed}
                    total={3500}
                    gauge={true}
                    loading={loadingMiner}
                  />
                </GridItem>
              </Grid>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Miner;
