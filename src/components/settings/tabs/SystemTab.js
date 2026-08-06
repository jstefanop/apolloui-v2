import React from 'react';
import { SimpleGrid, Flex } from '@chakra-ui/react';
import WifiSettings from '../sections/WifiSettings';
import PasswordSettings from '../sections/PasswordSettings';
import TemperatureSettings from '../sections/TemperatureSettings';

// Two columns, not three. WiFi is the tall one — a list of networks that grows
// with the neighbourhood — so it takes a column of its own and the two short
// panels stack beside it instead of being squeezed into narrow thirds.
const SystemTab = () => (
  <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px" alignItems="start">
    <WifiSettings />
    {/* No gap here: each panel already carries its own bottom margin, and both
        would stack into a double space. */}
    <Flex direction="column">
      <PasswordSettings />
      <TemperatureSettings />
    </Flex>
  </SimpleGrid>
);

export default SystemTab;
