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
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector() {
  const textColor = useColorModeValue('gray.600', 'white');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuHoverBg = useColorModeValue('gray.300', 'gray.700');
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
      <MenuList bg={menuBg}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            bg={menuBg}
            _hover={{ bg: menuHoverBg }}
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