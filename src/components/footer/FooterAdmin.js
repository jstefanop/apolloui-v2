/*eslint-disable*/
import React from 'react';
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';

import config from '../../config.json';
import { getVersionFromPackageJson } from '../../lib/utils';

export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  const { toggleColorMode } = useColorMode();
  return (
    <Flex
      zIndex='3'
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems={{
        base: 'center',
        xl: 'start',
      }}
      justifyContent='space-between'
      px={{ base: '30px', md: '50px' }}
      pb='30px'
    >
      <Text
        color={textColor}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        mb={{ base: '20px', xl: '0px' }}
      >
        {' '}
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          Apollo Web OS v{getVersionFromPackageJson()} Made with love by
          <Link
            mx='3px'
            color={textColor}
            href={config.mainWebsite}
            target='_blank'
            fontWeight='700'
          >
            FutureBit
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
