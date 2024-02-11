// chakra imports
import { Box, Flex, Stack } from '@chakra-ui/react';
//   Custom components
import Brand from './Brand';
import Links from './Links';
import React from 'react';

// FUNCTIONS

function SidebarContent({ routes, onClose }) {
  // SIDEBAR
  return (
    <Flex direction="column" height="100%" pt="25px" borderRadius="30px">
      <Brand />
      <Stack direction="column" mt="8px" h="100%" mb="80px">
        <Box ps="0px" mb="auto">
          <Links routes={routes.filter((r) => !r.bottom)} onClose={onClose} />
        </Box>
        <Box ps="0px" mt="auto">
          <Links routes={routes.filter((r) => r.bottom)} onClose={onClose} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
