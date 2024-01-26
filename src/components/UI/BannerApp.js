import React from 'react';

import { Button, Flex, Link, Text } from '@chakra-ui/react';
import banner from '../../assets/img/apps/NftBanner1.png';

export default function BannerApp({ icon, author, name }) {
  // Chakra Color Mode
  return (
    <Flex
      direction="column"
      bgImage={banner.src}
      bgSize="cover"
      py={{ base: '30px', md: '56px' }}
      px={{ base: '30px', md: '64px' }}
      borderRadius="30px"
    >
      <Text
        fontSize={{ base: '24px', md: '34px' }}
        color="white"
        mb="14px"
        maxW={{
          base: '100%',
          md: '64%',
          lg: '46%',
          xl: '70%',
          '2xl': '50%',
          '3xl': '42%',
        }}
        fontWeight="700"
        lineHeight={{ base: '32px', md: '42px' }}
      >
        Discover, collect, and sell extraordinary NFTs
      </Text>
      <Text
        fontSize="md"
        color="#E3DAFF"
        maxW={{
          base: '100%',
          md: '64%',
          lg: '40%',
          xl: '56%',
          '2xl': '46%',
          '3xl': '34%',
        }}
        fontWeight="500"
        mb="40px"
        lineHeight="28px"
      >
        Enter in this creative world. Discover now the latest NFTs or start
        creating your own!
      </Text>
      <Flex direction={{ base: 'row' }} justify="space-between">
        <Flex align="center">
          {icon && icon}
          <Flex
            direction="column"
            w={{ base: '70%', md: '100%' }}
            me={{ base: '4px', md: '32px', xl: '10px', '3xl': '32px' }}
          >
            <Text
              color={'white'}
              fontSize={{
                base: 'md',
              }}
              mb="5px"
              fontWeight="bold"
              me="14px"
            >
              {name}
            </Text>
            <Text
              color="secondaryGray.600"
              fontSize={{
                base: 'sm',
              }}
              fontWeight="400"
              me="14px"
            >
              {author}
            </Text>
          </Flex>
        </Flex>
        <Flex align="center">
          <Button
            bg="white"
            color="black"
            _hover={{ bg: 'whiteAlpha.900' }}
            _active={{ bg: 'white' }}
            _focus={{ bg: 'white' }}
            fontWeight="500"
            fontSize="14px"
            py="20px"
            px="27"
            me="38px"
          >
            Install now
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
