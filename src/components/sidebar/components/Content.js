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
    <Flex direction='column' height='100%' pt='25px' borderRadius='30px'>
      <Brand />
      <Stack direction='column' mb='auto' mt='8px'>
        <Box ps='20px' pe={{ md: '16px', '2xl': '1px' }}>
          <Links routes={routes.filter((r) => !r.bottom )} />
        </Box>
        <Box position={'absolute'} bottom='60px' ps='20px'>
          <Links routes={routes.filter((r) => r.bottom )} />
        </Box>
      </Stack>
      {/* 
      <Box
        ps='20px'
        pe={{ md: '16px', '2xl': '0px' }}
        mt='60px'
        mb='40px'
        borderRadius='30px'
      >
        <SidebarCard />
      </Box>
      */}
    </Flex>
  );
}

export default SidebarContent;
