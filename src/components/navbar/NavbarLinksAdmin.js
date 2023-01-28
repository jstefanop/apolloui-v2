// Chakra Imports
import {
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  MenuGroup,
  MenuDivider,
  Button,
} from '@chakra-ui/react';
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

import { SidebarResponsive } from '../sidebar/Sidebar';
import FixedPlugin from '../fixedPlugin/FixedPlugin';
import { MinerIcon } from '../UI/icons/MinerIcon';
import { NodeIcon } from '../UI/Icons/NodeIcon';
import { MinerTempIcon } from '../UI/Icons/MinerTemp';
import { PowerOffIcon } from '../UI/Icons/PowerOffIcon';

export default function HeaderLinks({
  secondary,
  routes,
  minerStats,
  minerOnline,
  blocksCount,
  errorNode,
  error,
  loading,
  handleSystemAction,
}) {
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.600', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const badgeColor = useColorModeValue('gray.700', 'white');
  const badgeBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const badgeBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  const { globalHashrate, avgBoardTemp } = minerStats;

  const nodeStatusLabel =
    blocksCount && !errorNode.length
      ? 'Online'
      : !blocksCount && !errorNode.length
      ? 'Offline'
      : errorNode.length
      ? 'Error'
      : 'Unknown';

  const minerStatusLabel =
    minerOnline && !error.length
      ? 'Online'
      : !minerOnline && !error.length
      ? 'Offline'
      : error
      ? 'Error'
      : 'Unknown';

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      px="14px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      {!loading && (
        <Center>
          {/* NODE */}
          <Flex
            bg={badgeBg}
            display={secondary ? 'flex' : 'none'}
            borderRadius="30px"
            ms="auto"
            p="6px"
            align="center"
            me="8px"
            px="10px"
          >
            <Flex
              align="center"
              justify="center"
              bg={badgeBox}
              h="29px"
              w="29px"
              borderRadius="30px"
              me="7px"
            >
              <Icon
                w="18px"
                h="18px"
                color={navbarIcon}
                as={NodeIcon}
              />
            </Flex>
            <Icon
              w="18px"
              h="18px"
              color={
                nodeStatusLabel === 'Online'
                  ? 'green.500'
                  : nodeStatusLabel === 'Offline'
                  ? 'red.500'
                  : nodeStatusLabel === 'Error'
                  ? 'orange.500'
                  : null
              }
              as={
                nodeStatusLabel === 'Online'
                  ? MdCheckCircle
                  : nodeStatusLabel === 'Offline'
                  ? MdCancel
                  : nodeStatusLabel === 'Error'
                  ? MdOutlineError
                  : null
              }
            />
          </Flex>

          {/* HASHRATE */}
          <Flex
            bg={badgeBg}
            display={secondary ? 'flex' : 'none'}
            borderRadius="30px"
            ms="auto"
            p="6px"
            align="center"
            me="8px"
            px="10px"
          >
            <Flex
              align="center"
              justify="center"
              bg={badgeBox}
              h="29px"
              w="29px"
              borderRadius="30px"
              me="7px"
            >
              <MinerIcon
                w="18px"
                h="18px"
                color={navbarIcon}
              />
            </Flex>
            <Text
              w="max-content"
              color={badgeColor}
              fontSize="sm"
              fontWeight="700"
              me="6px"
              minW="60px"
            >
              {`${globalHashrate?.value} ${globalHashrate?.unit}`}
            </Text>
            <Icon
              w="18px"
              h="18px"
              color={
                minerStatusLabel === 'Online'
                  ? 'green.500'
                  : minerStatusLabel === 'Offline'
                  ? 'red.500'
                  : minerStatusLabel === 'Error'
                  ? 'orange.500'
                  : null
              }
              as={
                minerStatusLabel === 'Online'
                  ? MdCheckCircle
                  : minerStatusLabel === 'Offline'
                  ? MdCancel
                  : minerStatusLabel === 'Error'
                  ? MdOutlineError
                  : null
              }
            />
          </Flex>

          {/* TEMPERATURE */}
          <Flex
            bg={badgeBg}
            display={secondary ? 'flex' : 'none'}
            borderRadius="30px"
            ms="auto"
            p="6px"
            align="center"
            me="6px"
          >
            <Flex
              align="center"
              justify="center"
              bg={badgeBox}
              h="29px"
              w="29px"
              borderRadius="30px"
              me="7px"
            >
              <MinerTempIcon w="18px" h="18px" color={navbarIcon} />
            </Flex>
            <Text
              w="max-content"
              color={badgeColor}
              fontSize="sm"
              fontWeight="700"
              me="6px"
            >
              {minerStatusLabel === 'Online' ? avgBoardTemp : '-'}
              {minerStatusLabel === 'Online' && <span>°C</span>}
            </Text>
          </Flex>

          <Flex p="0px" mx="4px">
            <FixedPlugin type="small" />
          </Flex>

          <SidebarResponsive routes={routes} />

          <Menu isLazy>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<PowerOffIcon />}
            />
            <MenuList>
              <MenuGroup title="Miner">
                {!minerOnline && (
                  <MenuItem
                    icon={<MdCancel />}
                    onClick={() => handleSystemAction('startMiner')}
                  >
                    Start
                  </MenuItem>
                )}
                {minerOnline && (
                  <>
                    <MenuItem
                      icon={<MdCancel />}
                      onClick={() => handleSystemAction('stopMiner')}
                    >
                      Stop
                    </MenuItem>
                    <MenuItem
                      icon={<MdCancel />}
                      onClick={() => handleSystemAction('restartMiner')}
                    >
                      Restart
                    </MenuItem>
                  </>
                )}
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Node">
                {!blocksCount && (
                  <MenuItem
                    icon={<MdCancel />}
                    onClick={() => handleSystemAction('startNode')}
                  >
                    Start
                  </MenuItem>
                )}
                {blocksCount && (
                  <MenuItem
                    icon={<MdCancel />}
                    onClick={() => handleSystemAction('stopNode')}
                  >
                    Stop
                  </MenuItem>
                )}
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="System">
                <MenuItem icon={<MdCancel />}>Shutdown</MenuItem>
                <MenuItem icon={<MdCancel />}>Reboot</MenuItem>
                <MenuItem icon={<MdCancel />}>Signout</MenuItem>
              </MenuGroup>
              <MenuDivider />
            </MenuList>
          </Menu>
        </Center>
      )}
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
