import {
  Box,
  Icon,
  Flex,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
  Button,
  Divider,
  Center,
  useDisclosure,
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
import { LastShareIcon } from '../components/UI/Icons/LastShareIcon';
import { PowerOffSolidIcon } from '../components/UI/Icons/PowerOffSolidIcon';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import { MinerTempIcon } from '../components/UI/Icons/MinerTemp';
import { FanIcon } from '../components/UI/Icons/FanIcon';
import { settingsSelector } from '../redux/reselect/settings';
import { ModeIcon } from '../components/UI/Icons/ModeIcon';
import { PowerManagementIcon } from '../components/UI/Icons/PowerManagementIcon';
import { FrequencyIcon } from '../components/UI/Icons/FrequencyIcon';
import { MinerIcon } from '../components/UI/Icons/MinerIcon';
import { PowerIcon } from '../components/UI/Icons/PowerIcon';
import { VoltageIcon } from '../components/UI/Icons/VoltageIcon';
import { DifficultyIcon } from '../components/UI/Icons/DifficultyIcon';
import { SharesSentIcon } from '../components/UI/Icons/SharesSentIcon';
import { SharesAcceptedIcon } from '../components/UI/Icons/SharesAcceptedIcon';
import { SharesRejectedIcon } from '../components/UI/Icons/SharesRejectedIcon';
import { ChipSpeedIcon } from '../components/UI/Icons/ChipSpeedIcon';
import { GrUserWorker } from 'react-icons/gr';
import MinerDrawer from '../components/apollo/MinerDrawer';
import PanelGrid from '../components/UI/PanelGrid';
import Head from 'next/head';
import CustomAlert from '../components/UI/CustomAlert';

const Miner = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white', 'white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  // Settings data
  const {
    loading: loadingSettings,
    data: dataSettings,
    error: errorSettings,
  } = useSelector(settingsSelector);

  // Miner data
  const {
    loading: loadingMiner,
    data: { online: minerOnline, stats: dataMiner },
    error: errorMiner,
  } = useSelector(minerSelector);

  const { status: minerStatus, timestamp } = useSelector(
    (state) => state.minerAction
  );

  // Set Previous state for CountUp component
  const prevData = useRef(dataMiner);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataMiner;
    }, process.env.NEXT_PUBLIC_POLLING_TIME);

    return () => clearInterval(intervalId);
  }, [dataMiner]);

  const {
    totalBoardRejected: prevAvgBoardRejected,
    avgBoardErrors: prevAvgBoardErrors,
    avgBoardTemp: prevAvgBoardTemp,
    globalHashrate: prevGlobalHashrate,
    globalAvgHashrate: prevGlobalAvgHashrate,
    minerPower: prevMinerPower,
    avgBoardEfficiency: prevAvgBoardEfficiency,
  } = prevData.current || {};

  const {
    globalHashrate,
    globalAvgHashrate,
    minerPower,
    avgBoardEfficiency,
    avgBoardTemp,
    avgBoardErrors,
    totalBoardRejected,
    totalBoardAccepted,
    avgChipSpeed,
    avgFanSpeed,
    avgVoltage,
    lastShareTime,
    minerUptime,
    totalSharesSent,
    totalSharesAccepted,
    totalSharesRejected,
    avgDiff,
    poolHashrate,
    activeBoards,
    totalBoards,
    activePools,
    boards,
    soloMining,
  } = dataMiner;

  const { minerMode, fanHigh, fanLow, frequency, voltage } = dataSettings;

  const dataTableBoards = [
    {
      value: `${globalHashrate?.value} ${globalHashrate?.unit}`,
      icon: MinerIcon,
    },
    {
      value: `${avgBoardTemp ? avgBoardTemp.toFixed(2) : 'n.a.'}°C`,
      icon: MinerTempIcon,
    },
    {
      value: `${(avgFanSpeed) ? avgFanSpeed.toFixed(1) : 'n.a.'} rpm`,
      icon: FanIcon,
    },
    {
      value: `${
        (avgBoardEfficiency && avgBoardEfficiency.toFixed(2)) || 0
      } W/TH`,
      icon: PowerIcon,
    },
    {
      value: avgVoltage ? `${avgVoltage.toFixed(2)} A` : 'N/A',
      icon: VoltageIcon,
    },
    {
      value: `${(avgBoardErrors && avgBoardErrors.toFixed(2)) || 0}%`,
      icon: BugIcon,
    },
  ];

  const dataTablePools = [
    {
      value: poolHashrate,
      icon: MinerIcon,
    },
    {
      value: (avgDiff) ? avgDiff.toFixed(1) : 'n.a.',
      icon: DifficultyIcon,
    },
    {
      value: null,
      icon: null,
    },
    {
      value: totalSharesSent,
      icon: SharesSentIcon,
    },
    {
      value: totalSharesAccepted,
      icon: SharesAcceptedIcon,
    },
    {
      value: totalSharesRejected,
      icon: SharesRejectedIcon,
    },
  ];

  return (
    <Box>
      <Head>
        <title>
          {globalHashrate
            ? `Apollo Miner ${globalHashrate.value} ${globalHashrate.unit}`
            : 'Apollo Miner'}
        </title>
      </Head>
      <MinerDrawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        data={boards}
      />
      {!minerOnline && !minerStatus && (
        <CustomAlert
          title="Miner is offline"
          description="Try and restart from the top menu."
          status="info"
        />
      )}
      {minerOnline && (
        <Grid
          templateRows={{ base: 'repeat(6, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(3, 1fr)' }}
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }}
          templateAreas={{
            base: `'Main' 'Main' 'Data' 'Data' 'Data' 'Data'`,
            md: `'Main Main Main Main' 'Data Data Data Data' 'Data Data Data Data' 'Data Data Data Data'`,
            lg: `'Main Main Data Data Data Data' 'Main Main Data Data Data Data' 'Main Main Data Data Data Data'`,
          }}
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
                avgData={avgBoardEfficiency || 0}
                prevData={prevMinerPower}
                prevAvgData={prevAvgBoardEfficiency}
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
              templateRows={{
                base: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                '3xl': 'repeat(1, 1fr)',
              }}
              templateColumns={{
                base: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                '3xl': 'repeat(4, 1fr)',
              }}
              templateAreas={{
                base: `'.' '.'`,
                md: `'. .'`,
                '3xl': `'. .'`,
              }}
              gap={'20px'}
            >
              <GridItem>
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
                  name="Accepted"
                  value={
                    <span
                      className={
                        avgBoardErrors !== prevAvgBoardErrors
                          ? 'animate__animated animate__flash'
                          : undefined
                      }
                    >
                      {totalBoardAccepted}
                    </span>
                  }
                  reversed={true}
                />
              </GridItem>
              <GridItem>
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
                  name="Rejected"
                  value={
                    <span
                      className={
                        totalBoardRejected !== prevAvgBoardRejected
                          ? 'animate__animated animate__flash'
                          : undefined
                      }
                    >
                      {totalBoardRejected}
                    </span>
                  }
                  reversed={true}
                />
              </GridItem>
              <GridItem>
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
                  name="Last share"
                  value={
                    lastShareTime ? lastShareTime?.replace('a few', '') : 'N/A'
                  }
                  reversed={true}
                />
              </GridItem>
              <GridItem>
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
              templateColumns={{ base: '1 1fr', md: 'auto 1fr' }}
              templateAreas={{
                base: `'.'`,
                md: `'. .'`,
              }}
              gap={'20px'}
            >
              <GridItem>
                <Card
                  py="15px"
                  pr="40px"
                  bgColor={cardColor}
                  boxShadow={shadow}
                >
                  <Flex m="2">
                    <Text fontSize="lg" fontWeight="800">
                      Device presets
                    </Text>
                  </Flex>
                  {loadingMiner ? (
                    <BulletList />
                  ) : (
                    <Flex my="auto" direction="column">
                      {soloMining && (
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
                                  as={GrUserWorker}
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name="SOLO Mining"
                          value={'ENABLED'}
                          reversed={true}
                        />
                      )}
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
                                as={ModeIcon}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Miner mode"
                        value={minerMode?.toUpperCase()}
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
                                as={PowerManagementIcon}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Power management"
                        value={minerMode === 'custom' ? `${voltage}%` : 'AUTO'}
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
                                as={FrequencyIcon}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Frequency"
                        value={
                          minerMode === 'custom' ? `${frequency}MHz` : 'AUTO'
                        }
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
                                as={FanIcon}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Fan management"
                        value={
                          fanLow !== 40 && fanHigh !== 60
                            ? `${fanLow}°C / ${fanHigh}°C`
                            : 'AUTO'
                        }
                        reversed={true}
                      />
                    </Flex>
                  )}
                </Card>
              </GridItem>
              <GridItem>
                <Card py="15px" bgColor={cardColor} boxShadow={shadow} h="100%">
                  <Flex
                    align={{ sm: 'flex-start', lg: 'center' }}
                    justify="space-between"
                  >
                    <Flex m="2">
                      <Text fontSize="lg" fontWeight="800">
                        Total pools and hashboards
                      </Text>
                    </Flex>
                    <Flex align-items="center">
                      <Button
                        bgColor="brand.800"
                        color="white"
                        variant="solid"
                        size="md"
                        onClick={onOpen}
                      >
                        Show all data
                      </Button>
                    </Flex>
                  </Flex>
                  {loadingMiner ? (
                    <BulletList />
                  ) : (
                    <Box mt="3">
                      <PanelGrid
                        title="Hashboards"
                        active={activeBoards}
                        total={totalBoards}
                        data={dataTableBoards}
                      />
                      <Center height="20px" mx="5">
                        <Divider />
                      </Center>
                      <PanelGrid
                        title="Pools"
                        active={activePools}
                        total={totalBoards}
                        data={dataTablePools}
                      />
                    </Box>
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
                  templateColumns={{
                    base: 'repeat(1, 1fr)',
                    md: 'repeat(3, 1fr)',
                  }}
                  templateAreas={{
                    base: `'.'`,
                    md: `'. . .'`,
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
                      value={
                        avgBoardTemp ? `${avgBoardTemp.toFixed(0)}°C` : 'N/A'
                      }
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
                              as={ChipSpeedIcon}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Chip speed"
                      value={avgChipSpeed ? avgChipSpeed.toFixed(2) : 'N/A'}
                      rawValue={avgChipSpeed}
                      total={240}
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
                      value={
                        avgFanSpeed ? `${avgFanSpeed.toFixed(0)} rpm` : 'N/A'
                      }
                      rawValue={avgFanSpeed}
                      total={6000}
                      gauge={true}
                      loading={loadingMiner}
                    />
                  </GridItem>
                </Grid>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Miner;
