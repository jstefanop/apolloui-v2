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
} from '@chakra-ui/react';
import moment from 'moment';
import CountUp from 'react-countup';
import Head from 'next/head';
import { List } from 'react-content-loader';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { FormattedNumber } from '../components/UI/FormattedNumber';
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
import { MdCastConnected } from 'react-icons/md';
import NodeStatus from '../components/UI/NodeStatus';

const Node = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  // Node data
  const {
    loading: loadingNode,
    data: dataNode,
    error: errorNode,
  } = useSelector(nodeSelector, shallowEqual);

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
  } = dataNode || {};

  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode);

  // Set Previous state for CountUp component
  const prevData = useRef(dataNode);

  useEffect(() => {
    // Store the current value directly when dataNode changes
    prevData.current = dataNode;
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
    const { used, total } = nodeDisk || {};
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

  const isServiceError = nodeServiceStatus?.status === 'error';

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
      <NodeStatus serviceStatus={servicesStatus} />

      {/* Render error alert if service status is in error state */}
      {isServiceError && (
        <Center>
          <Alert
            status="error"
            borderRadius="10px"
            mb="5"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            maxWidth="xl"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="xl">
              <FormattedMessage id="node.status.error.title" />
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <FormattedMessage id="node.status.error.description" />
            </AlertDescription>
          </Alert>
        </Center>
      )}

      {/* Only render the main content if service is not in error state and is online */}
      {!isServiceError && servicesStatus?.node?.status === 'online' && (
        <Flex direction="column">
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
                  {blocksCount === 0 && blockHeader === 0 ? (
                    <FormattedMessage id="node.title.pre_sync" />
                  ) : blockHeader === blocksCount ? (
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
                  {blocksCount === 0 && blockHeader === 0 ? (
                    <FormattedMessage id="node.stats.initializing" />
                  ) : blockHeader === blocksCount ? (
                    <FormattedMessage id="node.stats.synched" />
                  ) : (
                    <FormattedMessage
                      id="node.stats.synching"
                      values={{
                        percentage: ((blocksCount / blockHeader) * 100).toFixed(2),
                      }}
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
              <Flex direction="column" align={{ base: 'center', md: 'start' }}>
                <Text
                  color="white"
                  fontSize={{
                    base: blockHeader === blocksCount ? '4xl' : '2xl',
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
                  {blockHeader === blocksCount ? (
                    <Flex direction="row" alignItems="baseline">
                      <CountUp
                        start={prevData?.blocksCount || 0}
                        end={blocksCount}
                        duration="1"
                        decimals="0"
                        separator=","
                      />
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
                <Alert borderRadius={'10px'} status={errorNodeType || 'info'}>
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
                        blockHeader === blocksCount ? (
                          <FormattedMessage id="node.stats.last_block" />
                        ) : blockHeader > blocksCount ? (
                          <FormattedMessage
                            id="node.stats.percentage_completed"
                            values={{
                              percentage: ((blocksCount * 100) / blockHeader).toFixed(2),
                            }}
                          />
                        ) : (
                          '...'
                        )
                      }
                      value={
                        blockHeader === blocksCount
                          ? lastBlockTime
                          : blockHeader > blocksCount
                          ? (
                            <FormattedMessage id="node.stats.processing_queue" />
                          )
                          : '...'
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
                      secondaryText={numberToText(difficulty)}
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
                      name={
                        <FormattedMessage id="node.stats.connections" />
                      }
                      value={
                        <Flex>
                          {connectionCount}
                          <Text color="gray.400">
                            /{nodeMaxConnections || 64}
                          </Text>
                        </Flex>
                      }
                      progress={true}
                      progressValue={connectionCount}
                      progressTotal={nodeMaxConnections || 64}
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
                      value={nodeAddress}
                      reversed={true}
                      fontSize="md"
                      button={
                        <FormattedMessage id="node.stats.connect" />
                      }
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
                      value={subversion}
                      reversed={true}
                      fontSize="md"
                    />
                  </SimpleGrid>
                </Box>
              )}
            </Card>
          </Flex>
          {!loadingNode && !errorNode?.length && (
            <DynamicTable
              columnsData={columnsData}
              tableData={dataTable}
              tableTitle={
                <FormattedMessage id="node.table.title" />
              }
              shadow={shadow}
              mt="5"
            />
          )}
        </Flex>
      )}
    </Box>
  );
};

export default Node;
