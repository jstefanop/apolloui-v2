// chakra imports
import { Box, Flex, Stack } from '@chakra-ui/react';
//   Custom components
import Brand from './Brand';
import Links from './Links';
import SidebarCard from './SidebarCard';
import React from 'react';

// FUNCTIONS

function SidebarContent({ routes }) {
  // SIDEBAR
  return (
    <Flex direction="column" height="100%" pt="25px" borderRadius="30px">
      <Brand />
      <Stack direction="column"  mt="8px" h="100%" mb="80px">
        <Box ps="20px" mb="auto">
          <Links routes={routes.filter((r) => !r.bottom)} />
        </Box>
        <Box ps="20px" mt="auto">
          <Links routes={routes.filter((r) => r.bottom)} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
