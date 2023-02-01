import React from 'react';

// Chakra imports
import { Badge, Flex, Text } from '@chakra-ui/react';

import Card from '../card/Card';

export default function CardBanner(props) {
  const { illustration, focused, title, value, detail, ...rest } = props;

  return (
    <Card
      className={'banner-hashrate'}
      p={{ base: '20px', md: '60px' }}
      pt={{ base: '40px', md: '75px' }}
      pb="140px"
    >
      <Flex>
        <Badge
          w="max-content"
          mb="10px"
          fontSize="sm"
          bg="rgba(255,255,255,0.12)"
          color="white"
          fontWeight="bold"
        >
          PAID INVOICE
        </Badge>
      </Flex>
      <Flex
        mb={{ base: '0px', md: '50px' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          direction="row"
          color="white"
          h="100%"
          w="100%"
          mb={{ base: '20px', md: '0px' }}
        >
          <Text
            mt={{ base: '10px', md: '0px' }}
            fontSize={{ base: '2xl', md: '32px', lg: '44px', xl: '44px' }}
            fontWeight="bold"
          >
            Invoice #03941
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
