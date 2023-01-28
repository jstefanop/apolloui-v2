import PropTypes from 'prop-types';
import React from 'react';

// Chakra imports
import {
  Flex,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';

// Custom components
import Brand from '../sidebar/components/Brand';

export default function AuthNavbar(props) {
  const { logo, logoText, secondary, sidebarWidth, ...rest } = props;
  const { colorMode } = useColorMode();
  let logoColor = useColorModeValue('white', 'white');
  // Chakra color mode

  const textColor = useColorModeValue('navy.700', 'white');
  let mainText = '#fff';
  let navbarBg = 'none';
  let navbarShadow = 'initial';
  let navbarPosition = 'absolute';

  let brand = (
    <Link
      href={`${process.env.PUBLIC_URL}/#/`}
      target='_blank'
      display='flex'
      lineHeight='100%'
      fontWeight='bold'
      justifyContent='center'
      alignItems='center'
      color={mainText}
    >
      <Stack direction='row' align='center' justify='center'>
        <Brand />
      </Stack>
      <Text fontSize='sm' mt='3px'>
        {logoText}
      </Text>
    </Link>
  );

  return (
    <Flex
      px='16px'
      pt='32px'
      mx='auto'
      alignItems='center'
      zIndex='3'
    >
      {brand}
    </Flex>
  );
}

AuthNavbar.propTypes = {
  color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
  brandText: PropTypes.string,
};
