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
  Spinner,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { signOut } from 'next-auth/react';

import { SidebarResponsive } from '../sidebar/Sidebar';
import FixedPlugin from '../fixedPlugin/FixedPlugin';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import { NodeIcon } from '../UI/Icons/NodeIcon';
import { MinerTempIcon } from '../UI/Icons/MinerTemp';
import { PowerOffIcon } from '../UI/Icons/PowerOffIcon';
import { StopIcon } from '../UI/Icons/StopIcon';
import { RestartIcon } from '../UI/Icons/RestartIcon';
import { SignOutIcon } from '../UI/Icons/SignOutIcon';
import { CheckIcon } from '@chakra-ui/icons';
import { WarningIcon } from '../UI/Icons/WarningIcon';
import { StartIcon } from '../UI/Icons/StartIcon';
import Link from 'next/link';
import { PowerIcon } from '../UI/Icons/PowerIcon';
import { useSelector } from 'react-redux';

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

  const { status: minerStatus, timestamp } = useSelector(
    (state) => state.minerAction
  );

  const handleSignout = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem('token');
  };

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
      : minerOnline !== minerStatus
      ? 'Pending'
      : !minerOnline && !error.length
      ? 'Offline'
      : error
      ? 'Error'
      : 'Unknown';

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      justify={'end'}
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
              <Link href="/node">
                <Icon w="18px" h="18px" color={navbarIcon} as={NodeIcon} />
              </Link>
            </Flex>
            <Flex
              align="center"
              justify="center"
              bg={
                nodeStatusLabel === 'Online'
                  ? 'green.500'
                  : nodeStatusLabel === 'Offline'
                  ? 'gray.400'
                  : nodeStatusLabel === 'Error'
                  ? 'orange.500'
                  : null
              }
              h="20px"
              w="20px"
              borderRadius="30px"
            >
              <Icon
                w="12px"
                h="12px"
                color={badgeBox}
                as={
                  nodeStatusLabel === 'Online'
                    ? CheckIcon
                    : nodeStatusLabel === 'Offline'
                    ? PowerIcon
                    : nodeStatusLabel === 'Error'
                    ? WarningIcon
                    : null
                }
              />
            </Flex>
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
              <Link href="/miner">
                <MinerIcon w="18px" h="18px" color={navbarIcon} />
              </Link>
            </Flex>
            {globalHashrate?.value && (
              <Text
                align={'center'}
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="700"
                me="6px"
                minW="70px"
              >
                {`${globalHashrate?.value || 0} ${globalHashrate?.unit || ''}`}
              </Text>
            )}
            <Flex
              align="center"
              justify="center"
              bg={
                minerStatusLabel === 'Online'
                  ? 'green.500'
                  : minerStatusLabel === 'Offline'
                  ? 'gray.400'
                  : minerStatusLabel === 'Error'
                  ? 'orange.500'
                  : minerStatusLabel === 'Pending'
                  ? 'gray.300'
                  : null
              }
              h="20px"
              w="20px"
              borderRadius="30px"
            >
              <Icon
                w="12px"
                h="12px"
                color={badgeBox}
                as={
                  minerStatusLabel === 'Online'
                    ? CheckIcon
                    : minerStatusLabel === 'Offline'
                    ? PowerIcon
                    : minerStatusLabel === 'Error'
                    ? WarningIcon
                    : minerStatusLabel === 'Pending'
                    ? Spinner
                    : null
                }
              />
            </Flex>
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

          <Flex p="0px" mx="4px" justify="flex-end">
            <Menu isLazy>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<PowerOffIcon />}
              />
              <MenuList>
                <MenuGroup title="Miner">
                  <MenuItem
                    icon={<StartIcon />}
                    isDisabled={minerOnline}
                    onClick={() => handleSystemAction('startMiner')}
                  >
                    Start
                  </MenuItem>
                  <MenuItem
                    icon={<StopIcon />}
                    isDisabled={!minerOnline}
                    onClick={() => handleSystemAction('stopMiner')}
                  >
                    Stop
                  </MenuItem>
                  <MenuItem
                    icon={<RestartIcon />}
                    isDisabled={!minerOnline}
                    onClick={() => handleSystemAction('restartMiner')}
                  >
                    Restart
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Node">
                  <MenuItem
                    icon={<StartIcon />}
                    isDisabled={blocksCount}
                    onClick={() => handleSystemAction('startNode')}
                  >
                    Start
                  </MenuItem>
                  <MenuItem
                    icon={<StopIcon />}
                    isDisabled={!blocksCount}
                    onClick={() => handleSystemAction('stopNode')}
                  >
                    Stop
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="System">
                  <MenuItem
                    icon={<RestartIcon />}
                    onClick={() => handleSystemAction('rebootMcu')}
                  >
                    Reboot
                  </MenuItem>
                  <MenuItem
                    icon={<PowerOffIcon />}
                    onClick={() => handleSystemAction('shutdownMcu')}
                  >
                    Shutdown
                  </MenuItem>
                  <MenuItem icon={<SignOutIcon />} onClick={handleSignout}>
                    Signout
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
              </MenuList>
            </Menu>
          </Flex>
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
