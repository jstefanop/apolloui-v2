import {
  Box,
  Icon,
  Flex,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef, useEffect } from 'react';
import { BulletList } from 'react-content-loader';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import IconBox from '../components/icons/IconBox';
import Card from '../components/card/Card';
import { minerSelector } from '../redux/reselect/miner';
import { nodeSelector } from '../redux/reselect/node';
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
import MinerDrawer from '../components/apollo/MinerDrawer';
import PanelGrid from '../components/UI/PanelGrid';
import Head from 'next/head';
import CustomAlert from '../components/UI/CustomAlert';
import moment from 'moment';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';

const SoloMining = () => {
  const router = useRouter();
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

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector);

  const { difficulty, networkhashps } = dataNode;

  // Set Previous state for CountUp component
  const prevData = useRef(dataMiner);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataMiner;
    }, process.env.NEXT_PUBLIC_POLLING_TIME);

    return () => clearInterval(intervalId);
  }, [dataMiner]);

  useEffect(() => {
    if (!loadingSettings && !nodeEnableSoloMining) router.push('/miner');
  }, [nodeEnableSoloMining, loadingSettings, router]);

  const { nodeEnableSoloMining } = dataSettings;

  const {
    ckPoolGlobalHashrate: prevCkPoolGlobalHashrate,
    ckPoolGlobalAvgHashrate: prevCkPoolGlobalAvgHashrate,
    ckPoolGlobalBestshare: prevCkPoolGlobalBestshare,
  } = prevData.current || {};

  const {
    globalHashrate,
    ckPoolGlobalHashrate,
    ckPoolGlobalAvgHashrate,
    ckPoolGlobalHashrate1d,
    ckPoolGlobalHashrate1h,
    ckPoolGlobalBestshare,
    activeBoards,
    totalBoards,
    ckPoolTotalUsers,
    ckPoolTotalWorkers,
    ckPoolTotalIdle,
    ckPoolLastUpdate,
    ckPoolUptime,
    ckPoolDisconnected,
    ckPoolTotalSharesAccepted,
    ckPoolTotalSharesRejected,
    boards,
  } = dataMiner;

  const bestShare = ckPoolGlobalBestshare / difficulty || 0;
  const prevBestShare = prevCkPoolGlobalBestshare / difficulty || 0;

  const dailyChance =
    1 / (((ckPoolGlobalHashrate1d * 1e9) / networkhashps) * 144);

  const boardsWorkersData = boards
    ? boards
        .map((board) => {
          return board.ckWorkers;
        })
        .flat()
    : [];

  const desiredKeys = [
    'hashrate5m',
    'hashrate1d',
    'workername',
    'lastshare',
    'shares',
    'bestever',
  ];

  const boardNames = [];

  const dataTableBoards = boardsWorkersData.map((element) => {
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
          case 'workername':
            boardNames.push(element[key]);
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
            value = `${((element[key] / difficulty) * 100).toFixed(4)}%`;
            icon = BlocksIcon;
            break;
        }
        mappedArray.push({ value, icon });
      }
    });
    return mappedArray;
  });

  return (
    <Box>
      <Head>
        <title>
          {globalHashrate
            ? `Apollo BTC Miner ${globalHashrate.value} ${globalHashrate.unit}`
            : 'Apollo BTC Miner'}
        </title>
      </Head>
      <MinerDrawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        data={boards}
      />
      {!minerOnline ? (
        <CustomAlert
          title="Miner is offline"
          description="Try to start it from the top menu."
          status="info"
        />
      ) : minerOnline && ckPoolDisconnected ? (
        <CustomAlert
          title="CK Pool Disconnected"
          description="Please check your node connection and the CK Pool status."
          status="warning"
        />
      ) : (
        <Grid
          templateRows={{ base: 'repeat(6, 1fr)', md: 'repeat(3, 1fr)' }}
          templateColumns={{ base: '1fr', md: 'repeat(6, 1fr)' }}
          templateAreas={{
            base: `'Main' 'Main' 'Data' 'Data' 'Data' 'Data'`,
            md: `'Main Main Data Data Data Data' 'Main Main Data Data Data Data' 'Main Main Data Data Data Data'`,
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
                data={ckPoolGlobalHashrate}
                avgData={ckPoolGlobalAvgHashrate}
                prevData={prevCkPoolGlobalHashrate}
                prevAvgData={prevCkPoolGlobalAvgHashrate}
                shadow={shadow}
                iconColor={iconColor}
              />
            </GridItem>

            <GridItem gridArea="Power">
              <BestShare
                loading={loadingMiner && loadingNode}
                errors={errorMiner}
                data={bestShare}
                avgData={bestShare * 100}
                prevData={prevBestShare}
                prevAvgData={prevBestShare * 100}
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
                '2xl': 'repeat(1, 1fr)',
              }}
              templateColumns={{
                base: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                '2xl': 'repeat(4, 1fr)',
              }}
              templateAreas={{
                base: `'.' '.'`,
                '2xl': `'. .'`,
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
                  name="Accepted shares"
                  value={
                    <span>
                      {ckPoolTotalSharesAccepted?.toLocaleString('en-US')}
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
                  name="Rejected shares"
                  value={
                    <span>
                      {ckPoolTotalSharesRejected?.toLocaleString('en-US')}
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
                    !ckPoolDisconnected && ckPoolLastUpdate
                      ? ckPoolLastUpdate?.replace('a few', '')
                      : 'N/A'
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
                  value={(!ckPoolDisconnected && ckPoolUptime) || 'N/A'}
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
                      Solo Info
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
                                as={GiDiamondTrophy}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Daily Chance of Solving a Solo Block"
                        value={`1 in ${
                          dailyChance.toLocaleString('en-US', {
                            maximumFractionDigits: 0,
                          }) || 'N/A'
                        }`}
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
                                as={FaUserFriends}
                                color={iconColorReversed}
                              />
                            }
                          />
                        }
                        name="Users"
                        value={ckPoolTotalUsers}
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
                        name="Workers"
                        value={ckPoolTotalWorkers}
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
                                opacity={'30%'}
                              />
                            }
                          />
                        }
                        name="Idle"
                        value={ckPoolTotalIdle}
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
                        SOLO Mining Workers
                      </Text>
                    </Flex>
                  </Flex>
                  {loadingMiner ? (
                    <BulletList />
                  ) : (
                    dataTableBoards.map((dataTable, index) => (
                      <Box mt="3" key={index}>
                        <PanelGrid
                          title={`Worker`}
                          active={activeBoards}
                          total={totalBoards}
                          data={dataTable}
                        />
                      </Box>
                    ))
                  )}
                </Card>
              </GridItem>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SoloMining;
