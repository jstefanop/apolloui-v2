import React from 'react';
import { SimpleGrid, Box } from '@chakra-ui/react';
import WifiSettings from '../sections/WifiSettings';
import PasswordSettings from '../sections/PasswordSettings';
import TemperatureSettings from '../sections/TemperatureSettings';
import TimezoneSettings from '../sections/TimezoneSettings';
import LocationSettings from '../sections/LocationSettings';

// Desktop (xl): two narrow columns on the left, WiFi spanning two on the right.
//   col 1: Timezone + Location   col 2: Temperature + Password   cols 3-4: WiFi
// Each card carries its own mb, so plain Box columns space correctly.
const SystemTab = () => {
  return (
    <SimpleGrid columns={{ base: 1, xl: 4 }} gap="20px" mb="20px">
      <Box>
        <TimezoneSettings />
        <LocationSettings />
      </Box>
      <Box>
        <TemperatureSettings />
        <PasswordSettings />
      </Box>
      <Box gridColumn={{ base: '1', xl: 'span 2' }}>
        <WifiSettings />
      </Box>
    </SimpleGrid>
  );
};

export default SystemTab;
