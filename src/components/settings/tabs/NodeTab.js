import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import NodeSettings from '../sections/NodeSettings';

const NodeTab = () => {
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
      <NodeSettings />
    </SimpleGrid>
  );
};

export default NodeTab;