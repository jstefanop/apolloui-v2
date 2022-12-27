import {
  Box,
  Icon,
  Text,
  SimpleGrid,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import IconBox from '../components/icons/IconBox';
import React from 'react';
import {
  MdLocalFireDepartment,
  MdPower,
  MdWarning,
  MdWatchLater,
  MdMemory,
  MdOutlinePower,
  MdOutlineSignalWifi0Bar,
} from 'react-icons/md';
import { BsWind } from 'react-icons/bs';
import MiniStatistics from '../components/UI/MiniStatistics';
import MicroStatistics from '../components/UI/MicroStatistics';
import HashboardsTable from '../components/UI/HashboardsTable';
import PoolsTable from '../components/UI/PoolsTable';
import TotalHashrate from '../components/UI/TotalHashrate';
import ConnectionsTable from '../components/UI/ConnectionsTable';

const Dashboard = ({ miner }) => {
  const iconColor = useColorModeValue('brand.500', 'white');
  const iconMicroColor = useColorModeValue('gray.500', 'white');
  const iconMicroBg = useColorModeValue('gray.100', 'secondaryGray.700');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const secondaryBgColor = useColorModeValue(
    'secondaryGray.200',
    'secondaryGray.900'
  );

  console.log(miner);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Miner stats */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, '2xl': 4 }}
        gap='20px'
        mb='20px'
      >
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon
                  w='32px'
                  h='32px'
                  as={MdLocalFireDepartment}
                  color={iconColor}
                />
              }
            />
          }
          name='Current hashrate'
          value='2.80 TH/s'
          secondaryText={
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
              15 Min Avg: <strong>2.97 TH/s</strong>
            </Text>
          }
          progress={true}
          progressColor={'blue'}
          progressValue={80}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={<Icon w='32px' h='32px' as={MdPower} color={iconColor} />}
            />
          }
          name='Miner power usage'
          value='202 Watt'
          secondaryText={
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
              Watts per TH/s: <strong>66</strong>
            </Text>
          }
          progress={true}
          progressColor={'orange'}
          progressValue={89}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={<Icon w='32px' h='32px' as={MdWarning} color={iconColor} />}
            />
          }
          name='Hardware errors'
          value='0.9%'
          secondaryText={
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
              Rejected: <strong>47</strong>
            </Text>
          }
          progress={true}
          progressColor={'green'}
          progressValue={14}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdWatchLater} color={iconColor} />
              }
            />
          }
          name='Miner uptime'
          value='4 days'
          secondaryText={
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
              Last share: <strong>a few seconds ago</strong>
            </Text>
          }
          progress={true}
          progressColor={'green'}
          progressValue={100}
        />
      </SimpleGrid>

      <Grid
        templateRows='repeat(1, 1fr)'
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={'20px'}
        mb={'10px'}
      >
        <GridItem colSpan={{ base: 1, md: 3 }}>
          <TotalHashrate />
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
            <MicroStatistics
              startContent={
                <IconBox
                  w='42px'
                  h='42px'
                  bg={iconMicroBg}
                  icon={
                    <Icon
                      w='24px'
                      h='24px'
                      as={MdMemory}
                      color={iconMicroColor}
                    />
                  }
                />
              }
              name='Miner mode'
              value='Turbo'
            />
            <MicroStatistics
              startContent={
                <IconBox
                  w='42px'
                  h='42px'
                  bg={iconMicroBg}
                  icon={
                    <Icon
                      w='24px'
                      h='24px'
                      as={MdOutlinePower}
                      color={iconMicroColor}
                    />
                  }
                />
              }
              name='Miner power'
              value='Auto'
            />
            <MicroStatistics
              startContent={
                <IconBox
                  w='42px'
                  h='42px'
                  bg={iconMicroBg}
                  icon={
                    <Icon
                      w='24px'
                      h='24px'
                      as={MdOutlineSignalWifi0Bar}
                      color={iconMicroColor}
                    />
                  }
                />
              }
              name='Miner frequency'
              value='Auto'
            />
            <MicroStatistics
              startContent={
                <IconBox
                  w='42px'
                  h='42px'
                  bg={iconMicroBg}
                  icon={
                    <Icon
                      w='24px'
                      h='24px'
                      as={BsWind}
                      color={iconMicroColor}
                    />
                  }
                />
              }
              name='Fan temp settings'
              value='Auto'
            />
          </SimpleGrid>
        </GridItem>
      </Grid>

      {/* Hashboard stats */}
      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
        <HashboardsTable />
      </SimpleGrid>

      {/* Pools stats */}
      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
        <PoolsTable />
      </SimpleGrid>

      {/* Node stats */}
      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <SimpleGrid columns={{ base: 1 }} gap='20px' mb='20px'>
          <ConnectionsTable />
        </SimpleGrid>
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 2, '2xl': 2 }}
          gap='20px'
          mb='20px'
        >
          <MiniStatistics
            bgColor={secondaryBgColor}
            startContent={
              <IconBox
                w='56px'
                h='56px'
                bg={boxBg}
                icon={
                  <Icon
                    w='32px'
                    h='32px'
                    as={MdLocalFireDepartment}
                    color={iconColor}
                  />
                }
              />
            }
            name='Current Blocks'
            value='760,076'
            secondaryText={
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                Last block: <strong>23:45 minutes ago</strong>
              </Text>
            }
          />
          <MiniStatistics
            bgColor={secondaryBgColor}
            startContent={
              <IconBox
                w='56px'
                h='56px'
                bg={boxBg}
                icon={<Icon w='32px' h='32px' as={MdPower} color={iconColor} />}
              />
            }
            name='Connections'
            value='22 / 32'
            secondaryText={
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                Status: <strong>Synced and running</strong>
              </Text>
            }
            progress={true}
            progressColor={'blue'}
            progressValue={100}
          />
          <MiniStatistics
            bgColor={secondaryBgColor}
            startContent={
              <IconBox
                w='56px'
                h='56px'
                bg={boxBg}
                icon={
                  <Icon w='32px' h='32px' as={MdWarning} color={iconColor} />
                }
              />
            }
            name='Blockchain size'
            value='503.29GB'
            secondaryText={
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                Remaining space: <strong>47.53%</strong>
              </Text>
            }
            progress={true}
            progressColor={'green'}
            progressValue={48}
          />
          <MiniStatistics
            bgColor={secondaryBgColor}
            startContent={
              <IconBox
                w='56px'
                h='56px'
                bg={boxBg}
                icon={
                  <Icon w='32px' h='32px' as={MdWatchLater} color={iconColor} />
                }
              />
            }
            name='Network hashrate'
            value='262 PH/s'
            secondaryText={
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                Network difficulty: <strong>about 34 Trillion</strong>
              </Text>
            }
          />
        </SimpleGrid>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
