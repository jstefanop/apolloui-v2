/*eslint-disable*/
import React from 'react';
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import config from '../../config.json';

export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  return (
    <Flex
      w={{ base: '100%', xl: '1170px' }}
      maxW={{ base: '90%', xl: '1170px' }}
      zIndex='1.5'
      flexDirection={{
        base: 'row',
      }}
      alignItems={{
        base: 'center',
      }}
      justifyContent='space-between'
      mt='auto'
      mb='10'
      mx='auto'
    >
      <Text
        color={textColor}
        mb={{ base: '20px', xl: '0px' }}
      >
        {' '}
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          <Link
            mx='3px'
            color={textColor}
            href='https://www.futurebit.io'
            target='_blank'
            fontWeight='700'
          >
            FutureBit LLC
          </Link>
        </Text>
      </Text>
      <List display='flex'>
        {config.footerLinks.map((item, index) => {
          return (
            <ListItem
              me={{
                base: '20px',
                md: '44px',
              }}
              key={index}
            >
              <Link fontWeight='500' color={textColor} href={item.url}>
                {item.anchor}
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Flex>
  );
}
