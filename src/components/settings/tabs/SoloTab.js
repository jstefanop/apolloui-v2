import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import SoloSettings from '../sections/SoloSettings';

const SoloTab = () => {
  return (
    <SimpleGrid columns={{ base: 1 }} gap="20px" mb="20px">
      <SoloSettings />
    </SimpleGrid>
  );
};

export default SoloTab;
