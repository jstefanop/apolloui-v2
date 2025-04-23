import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Flex,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import { useSelector, shallowEqual } from 'react-redux';
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import { bytesToSize } from '../lib/utils';
import { mcuSelector } from '../redux/reselect/mcu';
import { CpuIcon } from '../components/UI/Icons/CpuIcon';
import { DatabaseIcon } from '../components/UI/Icons/DatabaseIcon';
import { MemoryIcon } from '../components/UI/Icons/MemoryIcon';
import Head from 'next/head';
import ParticlesCard from '../components/UI/ParticlesCard';
import MiniStatistics from '../components/UI/MiniStatistics';
import { ArchIcon } from '../components/UI/Icons/ArchIcon';
import { HostnameIcon } from '../components/UI/Icons/HostnameIcon';
import { LinuxIcon } from '../components/UI/Icons/LinuxIcon';
import { TimeIcon } from '../components/UI/Icons/TimeIcon';
import moment from 'moment';
import MultiStatistics from '../components/UI/MultiStatistics';
import { NetworkIcon } from '../components/UI/Icons/NetworkIcon';

const System = () => {
  const intl = useIntl();
  const cardColor = useColorModeValue('white', 'brand.800');
  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');

  // Mcu data
  const {
    loading: loadingMcu,
    data: dataMcu,
    error: errorMcu,
  } = useSelector(mcuSelector, shallowEqual);

  const {
    temperature: mcuTemperature,
    cpu: { threads: cpuCores, usedPercent: cpuUsage },
    disks,
    memory,
    architecture,
    activeWifi,
    hostname,
    network,
    operatingSystem,
    temperature,
    uptime,
  } = dataMcu;

  const wifi = activeWifi && activeWifi.split(',')[0];
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
      <Card py="15px" bgColor={cardColor}>
        <Grid
          templateAreas={{
            base: `'Illustration' 'MainData' 'Bottom'`,
            lg: `'Illustration MainData MainData' 'Bottom Bottom Bottom'`,
          }}
          templateRows={{
            base: 'auto auto auto',
            lg: 'auto auto',
          }}
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr',
          }}
          gap={'20px'}
          mb={'10px'}
        >
          <GridItem
            gridArea="Illustration"
            display={{ base: 'none', md: 'block' }}
          >
            <ParticlesCard />
          </GridItem>

          <GridItem gridArea="MainData">
            <SimpleGrid rows="2" columns={{ base: 1, md: 2 }} spacing="20px">
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'transparent'}
                    icon={
                      <ArchIcon w="32px" h="32px" color={iconColorReversed} />
                    }
                  />
                }
                name={intl.formatMessage({ id: 'system.stats.architecture' })}
                value={architecture}
                reversed={true}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'transparent'}
                    icon={
                      <HostnameIcon
                        w="32px"
                        h="32px"
                        color={iconColorReversed}
                      />
                    }
                  />
                }
                name={intl.formatMessage({ id: 'system.stats.hostname' })}
                value={hostname}
                reversed={true}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'transparent'}
                    icon={
                      <LinuxIcon w="32px" h="32px" color={iconColorReversed} />
                    }
                  />
                }
                name={intl.formatMessage({ id: 'system.stats.operating_system' })}
                value={operatingSystem}
                reversed={true}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={'transparent'}
                    icon={
                      <TimeIcon w="32px" h="32px" color={iconColorReversed} />
                    }
                  />
                }
                name={intl.formatMessage({ id: 'system.stats.system_uptime' })}
                value={moment(uptime).fromNow()}
                reversed={true}
              />
            </SimpleGrid>
            <Flex mt="20px">
              <MultiStatistics
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
                name={intl.formatMessage({ id: 'system.stats.active_wifi' })}
                value={wlan0 && wlan0.address ? wifi : intl.formatMessage({ id: 'system.stats.disconnected' })}
                name2={intl.formatMessage({ id: 'system.stats.ethernet' })}
                value2={eth0 && eth0.address ? intl.formatMessage({ id: 'system.stats.connected' }) : intl.formatMessage({ id: 'system.stats.disconnected' })}
                name3={intl.formatMessage({ id: 'system.stats.network_data' })}
                value3={
                  eth0 && eth0.address
                    ? `${eth0.address} - ${eth0.mac}`
                    : wlan0 && wlan0.address
                    ? `${wlan0.address} - ${wlan0.mac}`
                    : intl.formatMessage({ id: 'system.stats.disconnected' })
                }
                reversed={true}
              />
            </Flex>
          </GridItem>

          <GridItem gridArea="Bottom">
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
                value={`${cpuUsage}%`}
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
                legendValue={`${bytesToSize(
                  memoryUsed * 1024,
                  0
                )} / ${bytesToSize(memoryTotal * 1024, 0)}`}
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
                  legendValue={`${bytesToSize(
                    nodeDiskUsed * 1024,
                    0,
                    false
                  )} / ${bytesToSize(nodeDiskTotal * 1024, 0)}`}
                  rawValue={nodeDiskUsed}
                  total={nodeDiskTotal}
                  gauge={true}
                  loading={loadingMcu}
                />
              )}
            </SimpleGrid>
          </GridItem>
        </Grid>
      </Card>
    </Box>
  );
};

export default System;
