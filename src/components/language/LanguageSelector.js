import React from 'react';
import {
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSelector() {
  const textColor = useColorModeValue('gray.400', 'white');
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    languages.find(lang => lang.code === router.locale) || languages[0]
  );

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    router.push(router.pathname, router.asPath, { locale: lang.code });
  };

  return (
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
  );
} 