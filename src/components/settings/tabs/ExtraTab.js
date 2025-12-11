import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import ExtraSettingsActions from '../sections/ExtraSettingsActions';

const ExtraTab = () => {
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
      <ExtraSettingsActions />
    </SimpleGrid>
  );
};

export default ExtraTab;