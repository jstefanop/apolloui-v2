import {
  Box,
  Icon,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';

import IconBox from '../components/icons/IconBox';
import React from 'react';
import {
  MdLocalFireDepartment,
  MdPower,
  MdWarning,
  MdWatchLater
} from 'react-icons/md';
import MiniStatistics from '../components/UI/MiniStatistics';
import ConnectionsTable from '../components/UI/ConnectionsTable';

const Node = () => {
  const iconColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const secondaryBgColor = useColorModeValue(
    'secondaryGray.200',
    'secondaryGray.900'
  );

  return (
    <Box>
      {/* Node stats */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 2, '2xl': 4 }}
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
              icon={<Icon w='32px' h='32px' as={MdWarning} color={iconColor} />}
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
      <SimpleGrid columns={{ base: 1 }} gap='20px' mb='20px'>
        <ConnectionsTable />
      </SimpleGrid>
    </Box>
  );
};

export default Node;
