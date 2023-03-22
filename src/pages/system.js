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

import { useSelector } from 'react-redux';
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
  const cardColor = useColorModeValue('white', 'brand.800');

  const iconColor = useColorModeValue('white');
  const iconColorReversed = useColorModeValue('brand.500', 'white');

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
        <title>Apollo BTC System</title>
      </Head>
      <Card py="15px" bgColor={cardColor}>
        <Grid
          templateRows="auto auto"
          templateColumns={{ base: 'repeat(2, 1fr)' }}
          templateAreas={`'Illustration MainData' 'Bottom Bottom'`}
          gap={'20px'}
          mb={'10px'}
        >
          <GridItem gridArea="Illustration">
            <ParticlesCard />
          </GridItem>

          <GridItem gridArea="MainData">
            <SimpleGrid rows="2" columns="2" spacing="20px">
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
                name="Architecture"
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
                name="Hostanem"
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
                name="Operating System"
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
                name="System uptime"
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
                name="Active wifi"
                value={wlan0 && wlan0.address ? wifi : 'Disconnected'}
                name2="Ethernet"
                value2={eth0 && eth0.address ? 'Connected' : 'Disconnected'}
                name3="Network data"
                value3={
                  eth0 && eth0.address
                    ? `${eth0.address} - ${eth0.mac}`
                    : wlan0 && wlan0.address
                    ? `${wlan0.address} - ${wlan0.mac}`
                    : 'Disconnected'
                }
                reversed={true}
              />
            </Flex>
          </GridItem>

          <Grid
            gridArea="Bottom"
            templateRows="auto"
            templateColumns={{ base: 'repeat(4, 1fr)' }}
            templateAreas={{
              base: `. . . .`,
            }}
            gap={'20px'}
            mt="5"
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
            {mcuNoderyDisk && (
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
                  name="Node disk usage"
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
              </GridItem>
            )}
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default System;
