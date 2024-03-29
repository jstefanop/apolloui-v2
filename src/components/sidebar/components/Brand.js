import NextImage from 'next/image'
import { useRouter } from 'next/router';

// Chakra imports
import { Flex, useColorMode, useColorModeValue } from '@chakra-ui/react';

// Custom components
import Logo from '../../../assets/img/logo.png';
import LogoWhite from '../../../assets/img/logo_white.png';

export function SidebarBrand() {
  //   Chakra color mode
  const router = useRouter();
  let logoColor = useColorModeValue('navy.700', 'white');
  const { colorMode } = useColorMode();

  return (
    <Flex align='center' direction='column'>
      <NextImage src={(router.pathname === '/signin' || router.pathname === '/setup') ? LogoWhite : colorMode === 'light' ? Logo : LogoWhite} style={{width: '180px', marginBottom: '24px'}} alt="Logo" />
    </Flex>
  );
}

export default SidebarBrand;
