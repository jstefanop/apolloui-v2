import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { useSettings } from '../context/SettingsContext';
import PoolSettings from '../sections/PoolSettings';
import SoloSettings from '../sections/SoloSettings';

const PoolsTab = () => {
  const { settings } = useSettings();

  if (!settings.pool) {
    return null; // Or loading indicator
  }

  return (
    <SimpleGrid columns={{ base: 1 }} gap="20px" mb="20px">
      <PoolSettings />
      <SoloSettings />
    </SimpleGrid>
  );
};

export default PoolsTab;