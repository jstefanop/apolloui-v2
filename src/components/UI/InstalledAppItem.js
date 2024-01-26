import React from 'react';
import { Button, Flex, Icon, Image, Text, useColorModeValue } from '@chakra-ui/react';
import Card from '../../components/card/Card.js';
import { FaEthereum } from 'react-icons/fa';

export default function InstalledAppItem({ image, icon, name, author, link }) {
  // Chakra Color Mode
  const textColor = useColorModeValue('brands.900', 'white');
  const bgItem = useColorModeValue(
    { bg: 'white', boxShadow: '0px 40px 58px -20px rgba(112, 144, 176, 0.12)' },
    { bg: 'navy.700', boxShadow: 'unset' }
  );
  const textColorDate = useColorModeValue('secondaryGray.600', 'white');
  return (
    <Card
      _hover={bgItem}
      bg="transparent"
      boxShadow="unset"
      px="24px"
      py="21px"
      transition="0.2s linear"
    >
      <Flex direction={{ base: 'column' }} justify="center">
        <Flex position="relative" align="center">
          {image && <Image src={image.src} w="66px" h="66px" borderRadius="20px" me="16px" />}
          {icon && icon}
          <Flex
            direction="column"
            w={{ base: '70%', md: '100%' }}
            me={{ base: '4px', md: '32px', xl: '10px', '3xl': '32px' }}
          >
            <Text
              color={textColor}
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
          <Flex
            me={{ base: '4px', md: '32px', xl: '10px', '3xl': '32px' }}
            align="center"
          >
            <Button colorScheme="brand" size="sm">View</Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
