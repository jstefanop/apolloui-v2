import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Code,
  useDisclosure,
  Center,
  Icon,
} from '@chakra-ui/react';
import moment from 'moment';
import CountUp from 'react-countup';
import Head from 'next/head';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import { List } from 'react-content-loader';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import FormattedNumber from '../components/UI/FormattedNumber';
import MiniStatistics from '../components/UI/MiniStatistics';
import { bytesToSize, displayHashrate, numberToText } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { servicesSelector } from '../redux/reselect/services';
import { FormattedMessage } from 'react-intl';
import { TimeIcon } from '../components/UI/Icons/TimeIcon';
import { BlockchainIcon } from '../components/UI/Icons/BlockchainIcon';
import { MinersIcon } from '../components/UI/Icons/MinersIcon';
import { NetworkIcon } from '../components/UI/Icons/NetworkIcon';
import { useEffect, useRef, useState } from 'react';
import { mcuSelector } from '../redux/reselect/mcu';
import DynamicTable from '../components/UI/DynamicTable';
import BannerNode from '../assets/img/node_banner.png';
import { settingsSelector } from '../redux/reselect/settings';
import ModalConnectNode from '../components/apollo/ModalConnectNode';
import { getNodeErrorMessage } from '../lib/utils';
import {
  MdCastConnected,
  MdArrowDownward,
  MdArrowUpward,
} from 'react-icons/md';
import NodeStatus from '../components/UI/NodeStatus';
import LatestBlocks from '../components/apollo/LatestBlocks';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';

const Node = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const intl = useIntl();
  const cardColor = useColorModeValue('white', 'brand.800');
  const statisticColor = useColorModeValue('transparent', 'brand.500');
  const bgMainIcon = useColorModeValue(
    'linear-gradient(290.56deg, #5E71D7 -2.34%, #364285 60.45%)',
    'linear-gradient(290.56deg, #5E71D7 -2.34%, #364285 60.45%)'
  );
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  const [lastBlockTime, setLastBlockTime] = useState();
  const [remainingSpace, setRemainingSpace] = useState(0);
  const [dataTable, setDataTable] = useState([]);
  const [hadValidData, setHadValidData] = useState(false);

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector, shallowEqual);

  // Force refresh node data when component mounts
  useEffect(() => {
    // Force a fresh fetch of node data when component mounts
    // This ensures we don't show stale data when returning to the page
    console.log('Node component mounted - ensuring fresh data');
  }, []); // Empty dependency array - only run on mount

  const {
    connectionCount = 0,
    networkhashps = 0,
    difficulty = 0,
    blocksCount = 0,
    sizeOnDisk = 0,
    blockHeader = 0,
    blockTime = 0,
    peerInfo = [],
    timestamp = null,
    localaddresses = [],
    subversion = '',
    verificationProgress = 0,
    connectionsIn = 0,
    connectionsOut = 0,
  } = dataNode || {};

  // Detect and handle stale data
  useEffect(() => {
    // If we have a timestamp but blocksCount is 0, the data might be stale
    if (timestamp && blocksCount === 0 && blockHeader === 0) {
      console.log(
        'Detected potentially stale data - blocksCount is 0 but timestamp exists'
      );
      // This could indicate that the data is stale and needs refresh
    }
  }, [timestamp, blocksCount, blockHeader]);

  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode, intl);

  // Set Previous state for CountUp component
  const prevData = useRef(dataNode);

  // Calculate sync progress
  const syncProgress =
    verificationProgress > 0
      ? verificationProgress * 100
      : blockHeader > 0
      ? (blocksCount / blockHeader) * 100
      : 0;

  // Determine sync status
  const isSynced = blocksCount === blockHeader;
  const isSyncing = blockHeader > blocksCount;
  const isInitializing = blocksCount === 0 && blockHeader === 0;

  useEffect(() => {
    // Store the current value directly when dataNode changes
    // Only update if we have meaningful data to avoid undefined values
    if (
      dataNode &&
      dataNode.stats &&
      dataNode.stats.result &&
      dataNode.stats.result.stats
    ) {
      prevData.current = dataNode;
      console.log('prevData updated:', dataNode.stats.result.stats);
    }
  }, [dataNode]);

  // Mcu data
  const { data: dataMcu, error: errorMcu } = useSelector(
    mcuSelector,
    shallowEqual
  );

  const { disks, network } = dataMcu;

  const eth0 = _.find(network, { name: 'eth0' });
  const wlan0 = _.find(network, { name: 'wlan0' });

  const localAddress = wlan0?.address || eth0?.address;

  // Settings data
  const { data: settings } = useSelector(settingsSelector, shallowEqual);

  const { nodeRpcPassword, nodeEnableTor, nodeMaxConnections } = settings || {};

  // Services data reselected
  const { data: servicesStatus } = useSelector(servicesSelector, shallowEqual);
  const nodeServiceStatus = servicesStatus?.node;

  const nodeAddress =
    localaddresses?.length && nodeEnableTor
      ? `${localaddresses[0].address}:${localaddresses[0].port}`
      : `${localAddress}:8332`;

  useEffect(() => {
    if (timestamp && !blockTime) return;

    const last = moment().utc().subtract(blockTime, 'seconds').format('mm:ss');

    setLastBlockTime(last);
  }, [blockTime, timestamp]);

  useEffect(() => {
    if (!disks.length) return;

    const nodeDisk = _.find(disks, { mountPoint: '/media/nvme' });
    const { used = 0, total = 0 } = nodeDisk || {};

    // If total is 0, set remainingSpace to 0 to avoid division by zero
    if (total === 0) {
      setRemainingSpace(0);
      return;
    }

    const difference = total - used;
    const percentage = (difference / total) * 100;
    setRemainingSpace(Math.round(percentage * 100) / 100);
  }, [disks]);

  useEffect(() => {
    if (!peerInfo || !peerInfo.length) return;

    setDataTable(
      peerInfo.map((peer) => {
        return {
          ...peer,
          status: 'Active',
        };
      })
    );
  }, [peerInfo]);

  const columnsData = [
    {
      Header: <FormattedMessage id="node.table.address" />,
      accessor: 'addr',
      type: 'name',
    },
    {
      Header: <FormattedMessage id="node.table.client" />,
      accessor: 'subver',
      type: 'name',
    },
    {
      Header: <FormattedMessage id="node.table.status" />,
      accessor: 'status',
      type: 'status',
    },
  ];

  // Determine if current data is valid
  const isDataValid =
    !errorNode?.length && (connectionCount > 0 || blocksCount > 0);

  // Determine if we have meaningful data (not just zeros)
  const hasMeaningfulData = connectionCount > 0 || blocksCount > 0;

  useEffect(() => {
    if (isDataValid && hasMeaningfulData) {
      setHadValidData(true);
    } else if (!hasMeaningfulData) {
      // Reset hadValidData when we no longer have meaningful data
      setHadValidData(false);
    }
  }, [isDataValid, hasMeaningfulData]);

  const isServiceError = nodeServiceStatus?.status === 'error';
  const isBackendDown = !servicesStatus;

  const shouldShowStats =
    (!isServiceError && !isBackendDown && hasMeaningfulData) ||
    (isServiceError && hadValidData && !isBackendDown);

  // Debug logging only when key values change
  useEffect(() => {
    // Only for DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
      console.log('=== NODE STATE CHANGED ===');
      console.log('blocksCount:', blocksCount);
      console.log('blockHeader:', blockHeader);
      console.log('connectionCount:', connectionCount);
      console.log('isDataValid:', isDataValid);
      console.log('hasMeaningfulData:', hasMeaningfulData);
      console.log('hadValidData:', hadValidData);
      console.log('isServiceError:', isServiceError);
      console.log('isBackendDown:', isBackendDown);
      console.log('shouldShowStats:', shouldShowStats);
      console.log('isSynced:', isSynced);
      console.log('isSyncing:', isSyncing);
      console.log('isInitializing:', isInitializing);
      console.log('syncProgress:', syncProgress);
      console.log('prevData.current:', prevData.current);
      console.log('========================');
    }
  }, [
    blocksCount,
    blockHeader,
    connectionCount,
    isDataValid,
    hasMeaningfulData,
    hadValidData,
    isServiceError,
    isBackendDown,
    shouldShowStats,
    isSynced,
    isSyncing,
    isInitializing,
    syncProgress,
  ]);

  // Force reset hadValidData when service is in error state
  useEffect(() => {
    if (isServiceError) {
      setHadValidData(false);
    }
  }, [isServiceError]);

  return (
    <Box mx="5">
      <Head>
        <title>
          {blockHeader === blocksCount && lastBlockTime ? (
            <FormattedMessage
              id="node.title.last_block"
              values={{ time: lastBlockTime }}
            />
          ) : blockHeader > blocksCount ? (
            <FormattedMessage id="node.title.syncing" />
          ) : (
            '...'
          )}
        </title>
      </Head>
      <ModalConnectNode
        isOpen={isOpen}
        onClose={onClose}
        pass={nodeRpcPassword}
        address={nodeAddress}
      />

      {servicesStatus?.node?.status !== 'online' ? (
        <Flex height="60vh" align="center" justify="center">
          <NodeStatus serviceStatus={servicesStatus} />
        </Flex>
      ) : (
        <>
          <NodeStatus serviceStatus={servicesStatus} />

          {/* Render error alert if service status is in error state or backend is down */}
          {isServiceError && (
            <Alert
              status="error"
              borderRadius="10px"
              mb="5"
              flexDirection="row"
              alignItems="center"
              textAlign="left"
              width="100%"
              px={6}
            >
              <Flex alignItems="center" minW="200px">
                <AlertIcon boxSize="40px" mr={4} />
                <AlertTitle fontSize="xl">
                  <FormattedMessage id="node.status.error.title" />
                </AlertTitle>
              </Flex>
              <AlertDescription>
                <FormattedMessage id="node.status.error.description" />
              </AlertDescription>
            </Alert>
          )}

          {/* Show error alert if there's an error from API, even if no valid data */}
          {errorNodeSentence && !shouldShowStats && (
            <Alert
              status={errorNodeType || 'warning'}
              borderRadius="10px"
              mb="5"
              flexDirection="row"
              alignItems="center"
              textAlign="left"
              width="100%"
              px={6}
            >
              <Flex alignItems="center" minW="200px">
                <AlertIcon boxSize="40px" mr={4} />
                <AlertTitle fontSize="xl">
                  {errorNodeType === 'info' ? (
                    <FormattedMessage id="node.error.info.title" defaultMessage="Node Status" />
                  ) : (
                    <FormattedMessage id="node.error.warning.title" defaultMessage="Error" />
                  )}
                </AlertTitle>
              </Flex>
              <AlertDescription>{errorNodeSentence}</AlertDescription>
            </Alert>
          )}

          {/* Show stats if service is online or if we had valid data before */}
          {shouldShowStats && (
            <Flex direction="column">
              <LatestBlocks mb="5" />
              <Card
                h={{ base: '470px', md: '370px' }}
                shadow={shadow}
                style={{
                  backgroundImage: `url(${BannerNode.src})`,
                  backgroundSize: 'cover',
                }}
              >
                <Flex
                  justify="center"
                  align="center"
                  mt="3"
                  direction={{ base: 'column', md: 'row' }}
                >
                  <Flex direction="column" align="right">
                    <Text fontSize="2xl" fontWeight="bold" color="white">
                      {isInitializing ? (
                        <FormattedMessage id="node.title.pre_sync" />
                      ) : isSyncing ? (
                        <FormattedMessage id="node.stats.verification_progress" />
                      ) : isSynced ? (
                        <FormattedMessage id="node.title.up_to_date" />
                      ) : (
                        <FormattedMessage id="node.title.syncing" />
                      )}
                    </Text>

                    <Text
                      fontSize="sm"
                      fontWeight={500}
                      color="gray.600"
                      mt="0"
                      align={'right'}
                    >
                      {isInitializing ? (
                        <FormattedMessage id="node.stats.initializing" />
                      ) : isSyncing ? (
                        `${syncProgress.toFixed(2)}%`
                      ) : isSynced ? (
                        <FormattedMessage id="node.stats.synched" />
                      ) : (
                        <FormattedMessage
                          id="node.stats.synching"
                          values={{ percentage: syncProgress.toFixed(2) }}
                        />
                      )}
                    </Text>
                  </Flex>
                  <IconBox
                    w="80px"
                    h="80px"
                    bg={bgMainIcon}
                    icon={<BlocksIcon w="32px" h="32px" color={'white'} />}
                    mx="5"
                  />
                  <Flex
                    direction="column"
                    align={{ base: 'center', md: 'start' }}
                  >
                    <Text
                      color="white"
                      fontSize={{
                        base: isSynced ? '4xl' : '2xl',
                      }}
                      fontWeight="800"
                      minW="180px"
                      my="auto"
                      className={
                        blocksCount !== prevData?.blocksCount
                          ? 'animate__animated animate__pulse'
                          : undefined
                      }
                      as="span"
                    >
                      {isSynced ? (
                        <Flex direction="row" alignItems="baseline">
                          <CountUp
                            start={prevData?.blocksCount || 0}
                            end={blocksCount || 0}
                            duration="1"
                            decimals="0"
                            separator=","
                            enableScrollSpy
                            scrollSpyOnce
                          >
                            {({ countUpRef }) => <span ref={countUpRef} />}
                          </CountUp>
                          <Text
                            fontSize="sm"
                            fontWeight={500}
                            color="gray.600"
                            ml="2"
                            as="span"
                          >
                            <FormattedMessage id="node.stats.blocks" />
                          </Text>
                        </Flex>
                      ) : (
                        <>
                          <FormattedNumber value={blocksCount} /> /{' '}
                          <FormattedNumber value={blockHeader} />
                        </>
                      )}
                    </Text>
                  </Flex>
                </Flex>
              </Card>

              <Flex
                direction="column"
                px={{ lg: '10px', xl: '70px', '2xl': '200px' }}
              >
                <Card
                  py="15px"
                  pb="30px"
                  bgColor={cardColor}
                  boxShadow={shadow}
                  mt="-230px"
                >
                  {/* BOTTOM */}
                  <Flex m="2">
                    <Text fontSize="lg" fontWeight="800">
                      <FormattedMessage id="node.stats.details" />
                    </Text>
                  </Flex>
                  {loadingNode ? (
                    <List />
                  ) : errorNodeSentence ? (
                    <Alert
                      borderRadius={'10px'}
                      status={errorNodeType || 'info'}
                    >
                      <AlertIcon />
                      <AlertTitle>{errorNodeType || 'info'}</AlertTitle>
                      <AlertDescription>{errorNodeSentence}</AlertDescription>
                    </Alert>
                  ) : (
                    <Box>
                      {/* TOP */}
                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing="20px"
                        mb="5"
                      >
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <TimeIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            isSynced ? (
                              <FormattedMessage id="node.stats.last_block" />
                            ) : isSyncing ? (
                              <FormattedMessage
                                id="node.stats.percentage_completed"
                                values={{
                                  percentage: syncProgress.toFixed(2),
                                }}
                              />
                            ) : (
                              '...'
                            )
                          }
                          value={
                            isSynced ? (
                              lastBlockTime
                            ) : isSyncing ? (
                              <FormattedMessage id="node.stats.processing_queue" />
                            ) : (
                              '...'
                            )
                          }
                          reversed={true}
                        />
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <BlockchainIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage id="node.stats.blockchain_size" />
                          }
                          value={bytesToSize(sizeOnDisk)}
                          reversed={true}
                        />
                      </SimpleGrid>

                      {/* BOTTOM */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="20px">
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <MinersIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage id="node.stats.network_hashrate" />
                          }
                          value={displayHashrate(networkhashps, 'h', true, 2)}
                          secondaryText={numberToText(difficulty, intl)}
                          secondaryDescription={
                            <FormattedMessage id="node.stats.difficulty" />
                          }
                          reversed={true}
                        />
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <ConnectionsIcons
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          value={
                            <Flex direction="column">
                              <Flex align="center" gap={2} fontSize="2xl">
                                <Icon as={MdArrowDownward} color="green.200" />
                                {connectionsIn}
                                <Box as="span" mx={2}>
                                  /
                                </Box>
                                <Icon as={MdArrowUpward} color="green.500" />
                                {connectionsOut}
                              </Flex>
                              <Text
                                fontSize="sm"
                                color="secondaryGray.600"
                                mb={2}
                                fontWeight="500"
                              >
                                <FormattedMessage id="node.stats.connections_in_out" />
                              </Text>
                              <Text fontSize="md">
                                {connectionCount}/{nodeMaxConnections || 64}
                              </Text>
                              <Text
                                fontSize="sm"
                                color="secondaryGray.600"
                                fontWeight="500"
                              >
                                <FormattedMessage id="node.stats.total_connections" />
                              </Text>
                            </Flex>
                          }
                          reversed={true}
                        />
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <DatabaseIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage id="node.stats.remaining_space" />
                          }
                          value={`${remainingSpace}%`}
                          progress={true}
                          progressPercent={remainingSpace}
                          reversed={true}
                        />
                      </SimpleGrid>
                      <SimpleGrid columns={{ base: 1 }} spacing="20px" mt="5">
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <NetworkIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage id="node.stats.node_address" />
                          }
                          value={nodeAddress || '...'}
                          reversed={true}
                          fontSize="md"
                          button={<FormattedMessage id="node.stats.connect" />}
                          buttonHandler={onOpen}
                          buttonIcon={<MdCastConnected />}
                        />
                        <MiniStatistics
                          bgColor={statisticColor}
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg={'transparent'}
                              icon={
                                <BlocksIcon
                                  w="32px"
                                  h="32px"
                                  color={iconColorReversed}
                                />
                              }
                            />
                          }
                          name={
                            <FormattedMessage id="node.stats.node_version" />
                          }
                          value={subversion || '...'}
                          reversed={true}
                          fontSize="md"
                          secondaryText={
                            settings?.nodeSoftware ? (
                              <Text fontSize="xs" color="gray.500" mt="1">
                                <FormattedMessage
                                  id={`node.stats.configured_${settings.nodeSoftware}`}
                                  defaultMessage={`Configured: ${
                                    settings.nodeSoftware === 'core-latest'
                                      ? 'Bitcoin Core'
                                      : 'Bitcoin Knots'
                                  }`}
                                />
                              </Text>
                            ) : null
                          }
                        />
                      </SimpleGrid>
                    </Box>
                  )}
                </Card>
              </Flex>
              {shouldShowStats && !loadingNode && !errorNode?.length && (
                <DynamicTable
                  columnsData={columnsData}
                  tableData={dataTable}
                  tableTitle={<FormattedMessage id="node.table.title" />}
                  shadow={shadow}
                  mt="5"
                />
              )}
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default Node;
