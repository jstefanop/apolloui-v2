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
import { FormattedMessage } from 'react-intl';

import config from '../../config';
import { getVersionFromPackageJson } from '../../lib/utils';
import LanguageSelector from '../language/LanguageSelector';

const FooterAdmin = () => {
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
          <FormattedMessage
            id="footer.made_with_love"
            values={{ version: getVersionFromPackageJson() }}
          />
          <Link
            mx='3px'
            color={textColor}
            href={config.mainWebsite}
            target='_blank'
            fontWeight='700'
          >
            <FormattedMessage id="footer.futurebit" />
          </Link>
        </Text>
      </Text>
      <Flex alignItems="center" gap="20px">
        <LanguageSelector />
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
                  <FormattedMessage id={item.anchor} />
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Flex>
    </Flex>
  );
};

export default FooterAdmin;
