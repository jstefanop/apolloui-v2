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
} from '@chakra-ui/react';
import moment from 'moment';
import CountUp from 'react-countup';
import Head from 'next/head';
import { List } from 'react-content-loader';
import { useSelector } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import { BlocksIcon } from '../components/UI/Icons/BlocksIcon';
import { ConnectionsIcons } from '../components/UI/Icons/ConnectionsIcons';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import MiniStatistics from '../components/UI/MiniStatistics';
import { bytesToSize, displayHashrate, numberToText } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { FormattedNumber } from 'react-intl';
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
  } = useSelector(nodeSelector);

  const {
    connectionCount,
    networkhashps,
    difficulty,
    blocksCount,
    sizeOnDisk,
    blockHeader,
    blockTime,
    peerInfo,
    timestamp,
    localaddresses,
    subversion,
  } = dataNode;

  const { sentence: errorNodeSentence, type: errorNodeType } =
    getNodeErrorMessage(errorNode);

  // Set Previous state for CountUp component
  const prevData = useRef(dataNode);

  useEffect(() => {
    const intervalId = setInterval(() => {
      prevData.current = dataNode;
    }, process.env.NEXT_PUBLIC_POLLING_TIME_NODE);

    return () => clearInterval(intervalId);
  }, [dataNode]);

  // Mcu data
  const { data: dataMcu, error: errorMcu } = useSelector(mcuSelector);

  const { disks, network } = dataMcu;

  const eth0 = _.find(network, { name: 'eth0' });
  const wlan0 = _.find(network, { name: 'wlan0' });

  const localAddress = wlan0?.address || eth0?.address;

  // Settings data
  const { data: settings } = useSelector(settingsSelector);

  const { nodeRpcPassword, nodeEnableTor, nodeMaxConnections } = settings || {};

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
      Header: 'ADDRESS',
      accessor: 'addr',
      type: 'name',
    },
    {
      Header: 'CLIENT',
      accessor: 'subver',
      type: 'name',
    },
    {
      Header: 'STATUS',
      accessor: 'status',
      type: 'status',
    },
  ];

  return (
    <Box mx="5">
      <Head>
        <title>
          {blockHeader === blocksCount && lastBlockTime
            ? `${lastBlockTime}m since the last block`
            : blockHeader > blocksCount
            ? 'Syncing blocks...'
            : '...'}
        </title>
      </Head>
      <ModalConnectNode
        isOpen={isOpen}
        onClose={onClose}
        pass={nodeRpcPassword}
        address={nodeAddress}
      />
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
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {blockHeader === blocksCount
                ? `Current block`
                : `Syncing blocks...`}
            </Text>
            <IconBox
              w="80px"
              h="80px"
              bg={bgMainIcon}
              icon={<BlocksIcon w="32px" h="32px" color={'white'} />}
              mx="5"
            />
            <Text
              color="white"
              fontSize={{ base: blockHeader === blocksCount ? '4xl' : '2xl' }}
              fontWeight="800"
              minW="180px"
              my="auto"
              className={
                blocksCount !== prevData?.blocksCount
                  ? 'animate__animated animate__pulse'
                  : undefined
              }
              align={{ base: 'center', md: 'start' }}
            >
              {blockHeader === blocksCount && (
                <CountUp
                  start={prevData?.blocksCount || 0}
                  end={blocksCount}
                  duration="1"
                  decimals="0"
                  separator=","
                />
              )}
              {blockHeader !== blocksCount && (
                <>
                  <FormattedNumber value={blocksCount} /> /{' '}
                  <FormattedNumber value={blockHeader} />
                </>
              )}
            </Text>
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
                Details
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
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px" mb="5">
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
                      blockHeader === blocksCount
                        ? 'Minutes since last block'
                        : blockHeader > blocksCount
                        ? `Percentage completed ${(
                            (blocksCount * 100) /
                            blockHeader
                          ).toFixed(2)}%`
                        : '...'
                    }
                    value={
                      blockHeader === blocksCount
                        ? lastBlockTime
                        : blockHeader > blocksCount
                        ? `Processing queue...`
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
                    name="Blockchain size"
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
                    name="Network hashrate"
                    value={displayHashrate(networkhashps, 'h', true, 2)}
                    secondaryText={numberToText(difficulty)}
                    secondaryDescription="Difficulty"
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
                    name="Connections"
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
                    name="Remaining space"
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
                    name="Local node address"
                    value={nodeAddress}
                    reversed={true}
                    fontSize="md"
                    button={'Connect'}
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
                    name="Bitcoin Node Version"
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
            tableTitle={`Last connections`}
            shadow={shadow}
            mt="5"
          />
        )}
      </Flex>
    </Box>
  );
};

export default Node;
