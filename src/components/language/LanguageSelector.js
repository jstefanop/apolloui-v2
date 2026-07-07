import React from 'react';
import Image from 'next/image';
import {
  Box,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGlobe } from 'react-icons/fa';
import { useRouter } from 'next/router';

const languages = [
  // English uses a globe — the app ships in English by default for any locale,
  // so a country flag (UK / US) would be misleading.
  { code: 'en', name: 'English', icon: FaGlobe },
  { code: 'it', name: 'Italiano', flag: '/flags/it.svg' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.svg' },
  { code: 'es', name: 'Español', flag: '/flags/es.svg' },
];

const LanguageIcon = ({ lang, size = 20 }) => {
  if (lang.icon) {
    return (
      <Box
        width={`${size}px`}
        height={`${size}px`}
        borderRadius="full"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="gray.500"
      >
        <Icon as={lang.icon} boxSize={`${size}px`} />
      </Box>
    );
  }
  return (
    <Box
      width={`${size}px`}
      height={`${size}px`}
      borderRadius="full"
      overflow="hidden"
      flexShrink={0}
      boxShadow="0 0 0 1px rgba(0,0,0,0.1)"
    >
      <Image src={lang.flag} alt={lang.name} width={size} height={size} />
    </Box>
  );
};

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
          <LanguageIcon lang={selectedLanguage} />
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
              <LanguageIcon lang={lang} />
              <Text>{lang.name}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
} 