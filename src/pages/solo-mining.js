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
} from '@chakra-ui/react';
import { useRef, useEffect, useState } from 'react';
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
import ActiveBadge from '../components/apollo/ActiveBadge';
import PanelGrid from '../components/UI/PanelGrid';
import Head from 'next/head';
import CustomAlert from '../components/UI/CustomAlert';
import moment from 'moment';
import Cookies from 'js-cookie';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { filterRecentShares, shortenBitcoinAddress } from '../lib/utils';
import { mcuSelector } from '../redux/reselect/mcu';
import { InfoIcon } from '@chakra-ui/icons';
import SoloMiningDrawer from '../components/apollo/SoloMiningDrawer';

const SoloMining = () => {
  const router = useRouter();

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

  const isBannerDisabled = Cookies.get('solo-mining-banner-disabled');
  const [showBanner, setShowBanner] = useState(!isBannerDisabled);

  // Settings data
  const {
    loading: loadingSettings,
    data: dataSettings,
    error: errorSettings,
  } = useSelector(settingsSelector);

  const { nodeEnableSoloMining } = dataSettings;

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

  const { difficulty, networkhashps, blocksCount, blockHeader } = dataNode;

  // Mcu data
  const { data: dataMcu, error: errorMcu } = useSelector(mcuSelector);

  const { network } = dataMcu;

  const eth0 = _.find(network, { name: 'eth0' });
  const wlan0 = _.find(network, { name: 'wlan0' });

  const localAddress = wlan0?.address || eth0?.address;

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

  const {
    ckPoolGlobalHashrate: prevCkPoolGlobalHashrate,
    ckPoolGlobalAvgHashrate: prevCkPoolGlobalAvgHashrate,
    ckPoolGlobalBestshare: prevCkPoolGlobalBestshare,
  } = prevData.current || {};

  const {
    ckPoolHashrate1m: ckPoolGlobalHashrate,
    ckPoolHashrate1h: ckPoolGlobalAvgHashrate,
    ckPoolBestshare: ckPoolGlobalBestshare,
    ckPoolHashrateInGhs,
    ckUsersCount,
    ckWorkersCount,
    ckIdle,
    ckPoolLastUpdate,
    ckRuntime,
    ckDisconnected,
    ckSharesAccepted,
    ckSharesRejected,
    ckUsers = [],
  } = dataMiner;

  const prevBestSharePerc =
    1 / (((prevCkPoolGlobalBestshare * 1e11) / networkhashps) * 144) || 0;

  const dailyChance =
    ckPoolHashrateInGhs && networkhashps
      ? 1 / (((ckPoolHashrateInGhs * 1e9) / networkhashps) * 144)
      : null;

  const desiredKeys = [
    'hashrate5m',
    'hashrate1d',
    'lastshare',
    'shares',
    'bestever',
    'worker',
  ];

  const boardNames = [];

  const dataTableBoards = ckUsers.map((element) => {
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
    newDrawerState[index] = true; // Apre solo il drawer corrispondente all'indice
    setIsDrawerOpen(newDrawerState);
  };

  const handleClose = (index) => {
    const newDrawerState = [...isDrawerOpen];
    newDrawerState[index] = false; // Chiude solo il drawer corrispondente all'indice
    setIsDrawerOpen(newDrawerState);
  };

  const handleCloseBanner = () => {
    onCLoseBanner();
    setShowBanner(false);
    Cookies.set('solo-mining-banner-disabled', true);
  };
  const handleOpenBanner = () => {
    onOpenBanner();
    setShowBanner(true);
    Cookies.remove('solo-mining-banner-disabled');
  };

  return (
    <Box>
      <Head>
        <title>
          {ckPoolGlobalHashrate
            ? `Apollo BTC Miner ${ckPoolGlobalHashrate.value} ${ckPoolGlobalHashrate.unit}`
            : 'Apollo BTC Miner'}
        </title>
      </Head>

      {!minerOnline ? (
        <CustomAlert
          title="Miner is offline"
          description="Try to start it from the top menu."
          status="info"
        />
      ) : minerOnline && !ckPoolLastUpdate ? (
        <CustomAlert
          title="Waiting for first share"
          description="Please wait until the first share is received."
          status="info"
        />
      ) : minerOnline && ckDisconnected ? (
        <CustomAlert
          title="CK Pool Disconnected"
          description="Please check your node connection and the CK Pool status."
          status="warning"
        />
      ) : (
        <>
          {minerOnline && blocksCount !== blockHeader && (
            <Alert mb="5" borderRadius={'10px'} status={'warning'}>
              <AlertIcon mr={4} />
              <AlertTitle>Node not synced</AlertTitle>
              <AlertDescription>{`Node needs to be synced to correctly mine on SOLO mode. Please check your node for problems.`}</AlertDescription>
            </Alert>
          )}
          {showBanner || isVisibleBanner ? (
            <Alert mb="5" borderRadius={'10px'} status={'info'}>
              <AlertIcon mr={4} />
              <AlertTitle>SOLO LAN Mining</AlertTitle>
              <AlertDescription>{`Point any Bitcoin Miner on your local network to your Solo Pool with the following URL: ${localAddress}:3333 Username: <bitcoin address>`}</AlertDescription>
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
              {'Connect'}
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
                data={ckPoolGlobalHashrate}
                avgData={ckPoolGlobalAvgHashrate}
                prevData={prevCkPoolGlobalHashrate}
                prevAvgData={prevCkPoolGlobalAvgHashrate}
                shadow={shadow}
                iconColor={iconColor}
              />
            </GridItem>

            <GridItem gridArea="bestshare">
              <BestShare
                loading={loadingMiner && loadingNode}
                errors={errorMiner}
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
                  name="Accepted shares"
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
                  name="Rejected shares"
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
                  name="Last share"
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
                  name="Uptime"
                  value={(!ckDisconnected && ckRuntime) || 'N/A'}
                  reversed={true}
                />
              </SimpleGrid>
            </GridItem>

            <GridItem gridArea="info">
              <Card py="15px" pr="40px" bgColor={cardColor} boxShadow={shadow}>
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
                      value={
                        dailyChance
                          ? `1 in ${dailyChance.toLocaleString('en-US', {
                              maximumFractionDigits: 0,
                            })}`
                          : 'N/A'
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
                              as={FaUserFriends}
                              color={iconColorReversed}
                            />
                          }
                        />
                      }
                      name="Users"
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
                      name="Workers"
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
                              opacity={'30%'}
                            />
                          }
                        />
                      }
                      name="Idle"
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
                      SOLO Mining Users
                    </Text>
                  </Flex>
                </Flex>
                {loadingMiner ? (
                  <BulletList />
                ) : !dataTableBoards.length ? (
                  <Text m="3">Waiting for stats to refresh...</Text>
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
                        />
                        <Flex justifyContent={{ base: 'flex-end' }} mr="4">
                          <Button
                            bgColor="brand.700"
                            color="white"
                            variant="solid"
                            size="sm"
                            onClick={() => handleOpen(index)}
                          >
                            Show all data
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
                                title="Active"
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
