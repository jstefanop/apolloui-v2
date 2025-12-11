import React from 'react';
import { SimpleGrid, Box, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import WifiSettings from '../sections/WifiSettings';
import PasswordSettings from '../sections/PasswordSettings';
import TemperatureSettings from '../sections/TemperatureSettings';

const SystemTab = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');

  return (
    <SimpleGrid columns={{ base: 1, xl: 4 }} gap="20px" mb="20px">
      <Box gridColumn={{ base: '1', xl: 'span 2' }}>
        <WifiSettings />
      </Box>
      <Box>
        <TemperatureSettings />
      </Box>
      <Box>
        <PasswordSettings />
      </Box>
    </SimpleGrid>
  );
};

export default SystemTab;