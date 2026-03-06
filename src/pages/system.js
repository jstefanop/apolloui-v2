import {
  Box,
  useColorModeValue,
  Grid,
  SimpleGrid,
  Flex,
  Icon,
  Text,
  Circle,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import { bytesToSize, formatTemperature } from '../lib/utils';
import { settingsSelector } from '../redux/reselect/settings';
import { mcuSelector } from '../redux/reselect/mcu';
import { CpuIcon } from '../components/UI/Icons/CpuIcon';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { MemoryIcon } from '../components/UI/Icons/MemoryIcon';
import Head from 'next/head';
import { ArchIcon } from '../components/UI/Icons/ArchIcon';
import { HostnameIcon } from '../components/UI/Icons/HostnameIcon';
import { LinuxIcon } from '../components/UI/Icons/LinuxIcon';
import { TimeIcon } from '../components/UI/Icons/TimeIcon';
import moment from 'moment';
import MultiStatistics from '../components/UI/MultiStatistics';
import { NetworkIcon } from '../components/UI/Icons/NetworkIcon';
import { FaWifi, FaEthernet, FaCopy, FaThermometerHalf, FaServer } from 'react-icons/fa';

const System = () => {
  const intl = useIntl();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');
  const toast = useToast();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: intl.formatMessage({ id: 'system.stats.copied' }),
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
      () => {
        toast({
          title: intl.formatMessage({ id: 'system.stats.copy_failed' }),
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    );
  };

  // Mcu data
  const {
    loading: loadingMcu,
    data: dataMcu,
    error: errorMcu,
  } = useSelector(mcuSelector, shallowEqual);

  // Settings data
  const { data: settings } = useSelector(settingsSelector, shallowEqual);
  const { temperatureUnit } = settings || {};

  const {
    temperature: mcuTemperature,
    cpu = {},
    disks = [],
    memory = {},
    architecture,
    activeWifi,
    hostname,
    network = [],
    operatingSystem,
    temperature,
    uptime,
    loadAverage,
  } = dataMcu || {};

  const { threads: cpuCores, usedPercent: cpuUsage } = cpu || {};

  const wifi = activeWifi && typeof activeWifi === 'string' ? activeWifi.split(',')[0] : null;
  const eth0 = _.find(network, { name: 'eth0' });
  const wlan0 = _.find(network, { name: 'wlan0' });

  const mcuPrimaryDisk = _.find(disks, { mountPoint: '/' });
  const { used: diskUsed, total: diskTotal } = mcuPrimaryDisk || {};

  const mcuNoderyDisk = _.find(disks, { mountPoint: '/media/nvme' });
  const { used: nodeDiskUsed, total: nodeDiskTotal } = mcuNoderyDisk || {};

  const { used: memoryUsed, total: memoryTotal } = memory || {};

  return (
    <Box>
      <Head>
        <title>{intl.formatMessage({ id: 'system.title' })}</title>
      </Head>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px" mb="20px">
        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<ArchIcon w="32px" h="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.architecture' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {architecture || 'N/A'}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<HostnameIcon w="32px" h="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.hostname' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {hostname || 'N/A'}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<LinuxIcon w="32px" h="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.operating_system' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {operatingSystem || 'N/A'}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<TimeIcon w="32px" h="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.system_uptime' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {uptime ? moment(uptime).fromNow() : 'N/A'}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <Flex alignItems="center" mb="10px">
              <IconBox
                w="56px"
                h="56px"
                bg={'transparent'}
                icon={<FaWifi size="32px" color={iconColorReversed} />}
              />
              <Circle
                size="12px"
                bg={wlan0 && wlan0.address ? 'green.500' : 'red.500'}
                ml="10px"
              />
            </Flex>
            <Text fontSize="sm" color="gray.500">
              {intl.formatMessage({ id: 'system.stats.active_wifi' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {wlan0 && wlan0.address ? wifi : intl.formatMessage({ id: 'system.stats.disconnected' })}
            </Text>
            {wlan0 && wlan0.address && (
              <Flex alignItems="center" mt="5px">
                <Text fontSize="sm" color="gray.500">
                  {`${wlan0.address} - ${wlan0.mac}`}
                </Text>
                <IconButton
                  aria-label="Copy IP"
                  icon={<FaCopy />}
                  size="xs"
                  ml="2"
                  variant="ghost"
                  onClick={() => copyToClipboard(wlan0.address)}
                />
              </Flex>
            )}
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <Flex alignItems="center" mb="10px">
              <IconBox
                w="56px"
                h="56px"
                bg={'transparent'}
                icon={<FaEthernet size="32px" color={iconColorReversed} />}
              />
              <Circle
                size="12px"
                bg={eth0 && eth0.address ? 'green.500' : 'red.500'}
                ml="10px"
              />
            </Flex>
            <Text fontSize="sm" color="gray.500">
              {intl.formatMessage({ id: 'system.stats.ethernet' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {eth0 && eth0.address ? intl.formatMessage({ id: 'system.stats.connected' }) : intl.formatMessage({ id: 'system.stats.disconnected' })}
            </Text>
            {eth0 && eth0.address && (
              <Flex alignItems="center" mt="5px">
                <Text fontSize="sm" color="gray.500">
                  {`${eth0.address} - ${eth0.mac}`}
                </Text>
                <IconButton
                  aria-label="Copy IP"
                  icon={<FaCopy />}
                  size="xs"
                  ml="2"
                  variant="ghost"
                  onClick={() => copyToClipboard(eth0.address)}
                />
              </Flex>
            )}
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<FaThermometerHalf size="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.temperature' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {temperature != null ? formatTemperature(temperature / 1000, temperatureUnit) : 'N/A'}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<FaServer size="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.load_average' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {loadAverage && typeof loadAverage === 'string' ? loadAverage.split(' ')[0] : 'N/A'}
            </Text>
            <Text fontSize="xs" color="gray.500" mt="2px">
              {loadAverage && typeof loadAverage === 'string' ? loadAverage.split(' ').slice(1, 3).join(' ') : ''}
            </Text>
          </Flex>
        </Card>

        <Card py="15px" bgColor={cardColor}>
          <Flex direction="column" h="100%">
            <IconBox
              w="56px"
              h="56px"
              bg={'transparent'}
              icon={<MemoryIcon w="32px" h="32px" color={iconColorReversed} />}
            />
            <Text fontSize="sm" color="gray.500" mt="10px">
              {intl.formatMessage({ id: 'system.stats.memory_usage' })}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mt="5px">
              {memoryUsed != null ? bytesToSize(memoryUsed * 1024, 0) : 'N/A'}
            </Text>
            <Text fontSize="xs" color="gray.500" mt="2px">
              {memory?.available != null ? `${bytesToSize(memory.available * 1024, 0)} ${intl.formatMessage({ id: 'system.stats.available' })}` : ''}
            </Text>
          </Flex>
        </Card>
      </SimpleGrid>

      <Card py="15px" bgColor={cardColor}>
        <Text fontSize="xl" fontWeight="bold" mb="20px">
          {intl.formatMessage({ id: 'system.dashboard' })}
        </Text>
        <SimpleGrid
          columns={{ base: 1, md: mcuNoderyDisk ? 4 : 3 }}
          gap="20px"
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
                    as={CpuIcon}
                    color={iconColorReversed}
                  />
                }
              />
            }
            name={intl.formatMessage({ id: 'system.stats.cpu_usage' })}
            value={cpuUsage !== null && cpuUsage !== undefined ? `${cpuUsage}%` : 'N/A'}
            legendValue={`${cpuCores} ${intl.formatMessage({ id: 'system.stats.cores' })}`}
            percent={cpuUsage}
            gauge={true}
            loading={loadingMcu}
          />

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
            name={intl.formatMessage({ id: 'system.stats.memory_usage' })}
            legendValue={memoryUsed != null && memoryTotal != null ? `${bytesToSize(
              memoryUsed * 1024,
              0
            )} / ${bytesToSize(memoryTotal * 1024, 0)}` : 'N/A'}
            rawValue={memoryUsed}
            total={memoryTotal}
            gauge={true}
            loading={loadingMcu}
          />

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
            name={intl.formatMessage({ id: 'system.stats.system_disk_usage' })}
            legendValue={diskUsed != null && diskTotal != null ? `${bytesToSize(
              diskUsed * 1024,
              0,
              false
            )} / ${bytesToSize(diskTotal * 1024, 0)}` : 'N/A'}
            rawValue={diskUsed}
            total={diskTotal}
            gauge={true}
            loading={loadingMcu}
          />

          {mcuNoderyDisk && (
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
              name={intl.formatMessage({ id: 'system.stats.node_disk_usage' })}
              legendValue={nodeDiskUsed != null && nodeDiskTotal != null ? `${bytesToSize(
                nodeDiskUsed * 1024,
                0,
                false
              )} / ${bytesToSize(nodeDiskTotal * 1024, 0)}` : 'N/A'}
              rawValue={nodeDiskUsed}
              total={nodeDiskTotal}
              gauge={true}
              loading={loadingMcu}
            />
          )}
        </SimpleGrid>
      </Card>
    </Box>
  );
};

export default System;
