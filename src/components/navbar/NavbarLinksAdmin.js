// Chakra Imports
import { Flex, Icon, Text, useColorModeValue, Center } from '@chakra-ui/react';

import { SidebarResponsive } from '../sidebar/Sidebar';
import FixedPlugin from '../fixedPlugin/FixedPlugin';
import PropTypes from 'prop-types';
import React from 'react';
// Assets
import {
  MdCheckCircle,
  MdCancel,
  MdOutlineError,
  MdLocalFireDepartment,
  MdThermostat,
} from 'react-icons/md';

export default function HeaderLinks({ secondary, routes }) {
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const badgeColor = useColorModeValue('gray.700', 'white');
  const badgeBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const badgeBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  const minerStatus = 'Online';
  const softwareStatus = 'Updated';
  const softwareVer = '1.0.0-alpha';

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems='center'
      flexDirection='row'
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p='10px'
      borderRadius='30px'
      boxShadow={shadow}
    >
      <Center>
        <Flex
          bg={badgeBg}
          display={secondary ? 'flex' : 'none'}
          borderRadius='30px'
          ms='auto'
          p='6px'
          align='center'
          me='6px'
        >
          <Flex
            align='center'
            justify='center'
            bg={badgeBox}
            h='29px'
            w='29px'
            borderRadius='30px'
            me='7px'
          >
            <Icon
              w='24px'
              h='24px'
              color={
                minerStatus === 'Online'
                  ? 'green.500'
                  : minerStatus === 'Offline'
                  ? 'red.500'
                  : minerStatus === 'Error'
                  ? 'orange.500'
                  : null
              }
              as={
                minerStatus === 'Online'
                  ? MdCheckCircle
                  : minerStatus === 'Offline'
                  ? MdCancel
                  : minerStatus === 'Error'
                  ? MdOutlineError
                  : null
              }
            />
          </Flex>
          <Text
            w='max-content'
            color={badgeColor}
            fontSize='sm'
            fontWeight='700'
            me='6px'
          >
            {minerStatus}
          </Text>
        </Flex>

        <Flex p='0px' mx='10px'>
          <Icon
            as={MdLocalFireDepartment}
            color={navbarIcon}
            w='18px'
            h='18px'
            me='6px'
            mt='2px'
          />
          <Text w='max-content' fontSize='sm' fontWeight='700' me='6px'>
            2.80 TH/s
          </Text>
        </Flex>

        <Flex p='0px' mx='10px' display={{ base: 'none', md: 'flex' }}>
          <Icon
            as={MdThermostat}
            color={navbarIcon}
            w='18px'
            h='18px'
            me='6px'
            mt='2px'
          />
          <Text w='max-content' fontSize='sm' fontWeight='700' me='6px'>
            61°
          </Text>
        </Flex>

        <Flex p='0px' mx='10px'>
          <FixedPlugin type='small' />
        </Flex>

        <SidebarResponsive routes={routes} />

        <Flex
          bg={badgeBg}
          borderRadius='30px'
          ms='auto'
          p='6px'
          align='center'
          me='6px'
          display={{ base: 'none', md: 'flex' }}
        >
          <Flex
            align='center'
            justify='center'
            bg={badgeBox}
            h='29px'
            w='29px'
            borderRadius='30px'
            me='7px'
          >
            <Icon
              w='24px'
              h='24px'
              color={
                softwareStatus === 'UpdateAvailable'
                  ? 'orange.500'
                  : softwareStatus === 'Updated'
                  ? 'gray.300'
                  : null
              }
              as={
                softwareStatus === 'UpdateAvailable'
                  ? MdOutlineError
                  : softwareStatus === 'Updated'
                  ? MdCheckCircle
                  : null
              }
            />
          </Flex>
          <Text
            w='max-content'
            color={badgeColor}
            fontSize='sm'
            fontWeight='700'
            me='6px'
          >
            v{softwareVer}
          </Text>
        </Flex>
      </Center>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
