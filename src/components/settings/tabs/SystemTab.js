import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import WifiSettings from '../sections/WifiSettings';
import PasswordSettings from '../sections/PasswordSettings';
import TemperatureSettings from '../sections/TemperatureSettings';

const SystemTab = () => {
  return (
    <>
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
        <WifiSettings />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
        <PasswordSettings />
        <TemperatureSettings />
      </SimpleGrid>
    </>
  );
};

export default SystemTab;