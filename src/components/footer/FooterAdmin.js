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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

import config from '../../config';
import { getVersionFromPackageJson } from '../../lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  const { toggleColorMode } = useColorMode();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    languages.find(lang => lang.code === router.locale) || languages[0]
  );

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    router.push(router.pathname, router.asPath, { locale: lang.code });
  };

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
      <Flex alignItems="center" gap="20px">
        <Menu>
          <MenuButton
            as={Link}
            color={textColor}
            _hover={{ textDecoration: 'none' }}
          >
            <HStack spacing={2}>
              <Text fontSize="xl">{selectedLanguage.flag}</Text>
              <Text>{selectedLanguage.name}</Text>
            </HStack>
          </MenuButton>
          <MenuList bg={useColorModeValue('white', 'gray.800')}>
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                bg={useColorModeValue('white', 'gray.800')}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                <HStack spacing={2}>
                  <Text fontSize="xl">{lang.flag}</Text>
                  <Text>{lang.name}</Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
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
    </Flex>
  );
}
