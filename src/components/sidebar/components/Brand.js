import NextImage from 'next/image'

// Chakra imports
import { Flex, useColorMode, useColorModeValue } from '@chakra-ui/react';

// Custom components
import Logo from '../../../assets/img/logo.png';
import LogoWhite from '../../../assets/img/logo_white.png';
import { HSeparator } from '../../separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');
  const { colorMode } = useColorMode();

  return (
    <Flex align='center' direction='column'>
      <NextImage src={colorMode === 'light' ? Logo : LogoWhite} style={{width: '150px', marginBottom: '24px'}} alt="Logo" />
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
