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
  Box,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
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
import { GrUserWorker } from 'react-icons/gr';
import { GoVersions } from 'react-icons/go';
import { TbAlertHexagonFilled } from 'react-icons/tb';
import Link from 'next/link';
import { PowerIcon } from '../UI/Icons/PowerIcon';
import NavbarLogsModal from './NavbarLogsModal';
import SystemActionModal from './SystemActionModal';
import {
  getVersionFromPackageJson,
  capitalizeFirstLetter,
  formatTemperature,
} from '../../lib/utils';
import { useQuery } from '@apollo/client';
import { MCU_VERSION_QUERY } from '../../graphql/mcu';
import NavbarUpdateModal from './NavbarUpdateModal';
import NavbarFormatProgress from './NavbarFormatProgress';
import useNodeStorage from '../../hooks/useNodeStorage';
import { useSelector, shallowEqual } from 'react-redux';
import { soloSelector } from '../../redux/reselect/solo';
import { servicesSelector } from '../../redux/reselect/services';
import moment from '../../lib/moment';
import { useDeviceType } from '../../contexts/DeviceConfigContext';

const parseReleaseVersion = (version) => {
  if (typeof version !== 'string') return null;

  const match = version
    .trim()
    .match(
      /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
    );

  if (!match) return null;

  return {
    core: match.slice(1, 4).map(Number),
    prerelease: match[4] ? match[4].split('.') : [],
  };
};

const compareReleaseVersions = (remoteVersion, localVersion) => {
  const remote = parseReleaseVersion(remoteVersion);
  const local = parseReleaseVersion(localVersion);

  if (!remote || !local) return null;

  for (let index = 0; index < remote.core.length; index += 1) {
    if (remote.core[index] > local.core[index]) return 1;
    if (remote.core[index] < local.core[index]) return -1;
  }

  if (!remote.prerelease.length || !local.prerelease.length) {
    if (!remote.prerelease.length && !local.prerelease.length) return 0;
    return remote.prerelease.length ? -1 : 1;
  }

  const identifierCount = Math.max(
    remote.prerelease.length,
    local.prerelease.length
  );

  for (let index = 0; index < identifierCount; index += 1) {
    const remoteIdentifier = remote.prerelease[index];
    const localIdentifier = local.prerelease[index];

    if (remoteIdentifier === undefined) return -1;
    if (localIdentifier === undefined) return 1;
    if (remoteIdentifier === localIdentifier) continue;

    const remoteIsNumeric = /^\d+$/.test(remoteIdentifier);
    const localIsNumeric = /^\d+$/.test(localIdentifier);

    if (remoteIsNumeric && localIsNumeric) {
      return Number(remoteIdentifier) > Number(localIdentifier) ? 1 : -1;
    }
    if (remoteIsNumeric !== localIsNumeric) return remoteIsNumeric ? -1 : 1;
    return remoteIdentifier > localIdentifier ? 1 : -1;
  }

  return 0;
};

export default function HeaderLinks({
  secondary,
  routes,
  minerStats,
  minerOnline,
  soloOnline,
  settings,
  nodeOnline,
  error,
  loading,
  handleSystemAction,
}) {
  const deviceType = useDeviceType();
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

  // Without somewhere to put a blockchain the node cannot start, so the controls
  // that would try are turned off rather than left to fail.
  const intl = useIntl();
  const { unavailable: noNodeStorage, state: nodeStorageState } =
    useNodeStorage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLogsModalOpen,
    onOpen: onLogsModalOpen,
    onClose: onLogsModalClose,
  } = useDisclosure();
  const {
    isOpen: isSystemActionModalOpen,
    onOpen: onSystemActionModalOpen,
    onClose: onSystemActionModalClose,
  } = useDisclosure();
  const [systemActionType, setSystemActionType] = useState(null);

  const handleSignout = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem('token');
  };

  // Handle app update
  const localVersion = getVersionFromPackageJson();

  const { data: dataVersion, refetch: refetchVersion } =
    useQuery(MCU_VERSION_QUERY);

  const { result: remoteVersion } = dataVersion?.Mcu?.version || {};
  const versionComparison = compareReleaseVersions(remoteVersion, localVersion);
  const updateAvailable = versionComparison === 1;

  const onOpenModalVersion = async () => {
    await refetchVersion();
    onOpen();
  };

  const handleOpenSystemActionModal = (type) => {
    setSystemActionType(type);
    onSystemActionModalOpen();
  };

  const handleSystemActionConfirm = () => {
    if (systemActionType === 'reboot') {
      handleSystemAction('rebootMcu');
    } else if (systemActionType === 'shutdown') {
      handleSystemAction('shutdownMcu');
    }
  };

  // Solo data for pool connection status
  const {
    loading: loadingSolo,
    data: soloData,
    error: errorSolo,
  } = useSelector(soloSelector, shallowEqual);

  // Extract ckpool disconnected status from solo service
  const { pool: poolData } = soloData || {};
  // Never having heard from ckpool is not the same as having heard from it too
  // long ago. On a pool that has just been started there is no `lastupdate`
  // yet — it appears when ckpool first writes its status file — and treating
  // that absence as "disconnected" put a warning badge in the navbar on a pool
  // that was coming up perfectly well, for as long as it took to write.
  const ckPoolSilent = !poolData?.lastupdate;
  const ckPoolDisconnected =
    !ckPoolSilent &&
    moment().diff(moment.unix(poolData.lastupdate), 'seconds') > 90;

  // Silence is only patience for so long. A pool that has been online for a
  // minute without ever writing its status file is not still coming up — the
  // writer is gone, or logs/pool/ is unreadable — and that has to read as a
  // fault again, not as a spinner that never ends.
  const [ckPoolSilentTooLong, setCkPoolSilentTooLong] = useState(false);
  useEffect(() => {
    if (!(soloOnline === 'online' && ckPoolSilent)) {
      setCkPoolSilentTooLong(false);
      return undefined;
    }
    const timer = setTimeout(() => setCkPoolSilentTooLong(true), 60000);
    return () => clearTimeout(timer);
  }, [soloOnline, ckPoolSilent]);

  const ckPoolComingUp = soloOnline === 'online' && ckPoolSilent && !ckPoolSilentTooLong;

  // Parse stats
  const { globalHashrate, avgBoardTemp } = minerStats || {};

  const { nodeEnableSoloMining, temperatureUnit } = settings || {};

  // Whether the service statuses failed to arrive at all. `servicesSelector`
  // nulls its data on error, so without this an error and a first load look
  // identical from here — and "absent means pending" would leave all three
  // badges spinning for ever over a failure nothing else in the navbar reports.
  const { error: servicesError } = useSelector(servicesSelector, shallowEqual);
  const servicesFailed = !!servicesError?.length;

  // Not having heard yet is not an error.
  //
  // Service statuses arrive on their own WebSocket topic; miner and node stats
  // arrive on theirs, every 5 and 8 seconds. So the numbers are routinely on
  // screen before the first services push lands — and until it did, these
  // badges read "Error" in orange next to live data. An absent status is a
  // question, not an answer: it shows as pending until the device says
  // otherwise. A status of 'unknown' is different — that is the backend
  // asserting it could not tell — and keeps its warning.
  const nodeStatusLabel = nodeOnline
    ? capitalizeFirstLetter(nodeOnline)
    : servicesFailed
    ? 'Error'
    : 'Pending';

  const minerStatusLabel = minerOnline
    ? error.length
      ? 'Error'
      : capitalizeFirstLetter(minerOnline)
    : servicesFailed
    ? 'Error'
    : 'Pending';

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
      mt={{ base: 4, md: 0 }}
    >
      <NavbarUpdateModal
        isOpen={isOpen}
        onClose={onClose}
        localVersion={localVersion}
        remoteVersion={remoteVersion}
        versionCheckSucceeded={versionComparison !== null}
        updateAvailable={updateAvailable}
      />

      <NavbarLogsModal isOpen={isLogsModalOpen} onClose={onLogsModalClose} />

      <SystemActionModal
        isOpen={isSystemActionModalOpen}
        onClose={onSystemActionModalClose}
        actionType={systemActionType}
        onConfirm={handleSystemActionConfirm}
      />

      <Center>
        {/* NODE */}
        {/* The badge alone says something is wrong without saying what: on a
            device with no drive it is the only thing on screen, and "warning"
            is not an instruction. */}
        <Tooltip
          isDisabled={!noNodeStorage}
          label={
            noNodeStorage
              ? intl.formatMessage({ id: `node.storage.${nodeStorageState}` })
              : ''
          }
          placement="bottom"
          hasArrow
          maxW="320px"
        >
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
                  : nodeStatusLabel === 'Pending'
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
                  nodeStatusLabel === 'Online'
                    ? CheckIcon
                    : nodeStatusLabel === 'Offline'
                    ? PowerIcon
                    : nodeStatusLabel === 'Error'
                    ? WarningIcon
                    : nodeStatusLabel === 'Pending'
                    ? Spinner
                    : null
                }
              />
            </Flex>
          </Flex>
        </Tooltip>

        {/* SOLO MINING */}
        {(deviceType === 'solo-node' || nodeEnableSoloMining) && (
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
              <Link href="/solo-mining">
                <Icon
                  mt="8px"
                  w="18px"
                  h="18px"
                  color={navbarIcon}
                  as={GrUserWorker}
                />
              </Link>
            </Flex>
            <Flex
              align="center"
              justify="center"
              bg={
                soloOnline === 'online' && !ckPoolDisconnected && !ckPoolSilent
                  ? 'green.500'
                  : soloOnline === 'offline'
                  ? 'gray.400'
                  : (!soloOnline && !servicesFailed) ||
                    soloOnline === 'pending' ||
                    ckPoolComingUp
                  ? 'gray.300'
                  : 'orange.500'
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
                  soloOnline === 'online' && !ckPoolDisconnected && !ckPoolSilent
                    ? CheckIcon
                    : soloOnline === 'offline'
                    ? PowerIcon
                    : (!soloOnline && !servicesFailed) ||
                      soloOnline === 'pending' ||
                      ckPoolComingUp
                    ? Spinner
                    : WarningIcon
                }
              />
            </Flex>
          </Flex>
        )}

        {/* HASHRATE */}
        {!loading && deviceType !== 'solo-node' && (
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
            {!!globalHashrate?.value && minerStatusLabel === 'Online' && (
              <Text
                align={'center'}
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="700"
                me="6px"
                minW="70px"
                display={{
                  base: (deviceType === 'solo-node' || nodeEnableSoloMining) ? 'none' : 'block',
                  md: deviceType === 'solo-node' ? 'none' : 'block',
                }}
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
        )}

        {/* TEMPERATURE */}
        {!loading && deviceType !== 'solo-node' && (
          <Flex
            bg={badgeBg}
            display={secondary ? { base: 'none', md: 'flex' } : 'none'}
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
              {minerStatusLabel === 'Online' && avgBoardTemp !== null
                ? `${formatTemperature(avgBoardTemp, temperatureUnit)}`
                : '-'}
            </Text>
          </Flex>
        )}

        <Flex p="0px" mx="4px" display={{ base: 'none', md: 'block' }}>
          <FixedPlugin type="small" />
        </Flex>

        <Box display={{ base: 'none', md: 'block' }}>
          <SidebarResponsive routes={routes} />
        </Box>

        <NavbarFormatProgress />

        <Flex p="0px" mx="4px" justify="flex-end">
          <Menu isLazy>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={
                <PowerOffIcon
                  className={
                    updateAvailable &&
                    'animate__animated animate__tada animate__infinite'
                  }
                />
              }
              bg={updateAvailable && 'orange.500'}
            />
            <MenuList>
              {deviceType !== 'solo-node' && (
                <>
                  <MenuGroup title="Miner">
                    <MenuItem
                      icon={<StartIcon />}
                      isDisabled={
                        minerOnline === 'online' || minerOnline === 'pending'
                      }
                      onClick={() => handleSystemAction('startMiner')}
                    >
                      Start
                    </MenuItem>
                    <MenuItem
                      icon={<StopIcon />}
                      isDisabled={minerOnline === 'offline'}
                      onClick={() => handleSystemAction('stopMiner')}
                    >
                      Stop
                    </MenuItem>
                    <MenuItem
                      icon={<RestartIcon />}
                      isDisabled={
                        minerOnline === 'offline' || minerOnline === 'pending'
                      }
                      onClick={() => handleSystemAction('restartMiner')}
                    >
                      Restart
                    </MenuItem>
                  </MenuGroup>
                  <MenuDivider />
                </>
              )}
              <MenuGroup title="Node">
                <MenuItem
                  icon={<StartIcon />}
                  isDisabled={
                    noNodeStorage || nodeOnline === 'online' || nodeOnline === 'pending'
                  }
                  onClick={() => handleSystemAction('startNode')}
                >
                  Start
                </MenuItem>
                {/* Stopping is never gated on storage — the case where the
                    drive went away with bitcoind still running is exactly when
                    it must be stoppable, before the blockchain it is still
                    writing lands on the SD card. Start is; nothing can start
                    without somewhere to run. */}
                <MenuItem
                  icon={<StopIcon />}
                  isDisabled={nodeOnline === 'offline'}
                  onClick={() => handleSystemAction('stopNode')}
                >
                  Stop
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Solo Server">
                <MenuItem
                  icon={<StartIcon />}
                  isDisabled={
                    noNodeStorage ||
                    soloOnline === 'online' ||
                    soloOnline === 'pending'
                  }
                  onClick={() => handleSystemAction('startSolo')}
                >
                  Start
                </MenuItem>
                <MenuItem
                  icon={<StopIcon />}
                  isDisabled={soloOnline === 'offline'}
                  onClick={() => handleSystemAction('stopSolo')}
                >
                  Stop
                </MenuItem>
                <MenuItem
                  icon={<RestartIcon />}
                  isDisabled={
                    noNodeStorage ||
                    soloOnline === 'offline' ||
                    soloOnline === 'pending'
                  }
                  onClick={() => handleSystemAction('restartSolo')}
                >
                  Restart
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="System">
                <MenuItem
                  icon={<RestartIcon />}
                  onClick={() => handleOpenSystemActionModal('reboot')}
                >
                  Reboot
                </MenuItem>
                <MenuItem
                  icon={<PowerOffIcon />}
                  onClick={() => handleOpenSystemActionModal('shutdown')}
                >
                  Shutdown
                </MenuItem>
                <MenuItem icon={<SignOutIcon />} onClick={handleSignout}>
                  Signout
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Version">
                <MenuItem
                  icon={
                    updateAvailable ? (
                      <TbAlertHexagonFilled color="red" />
                    ) : (
                      <GoVersions />
                    )
                  }
                  onClick={() => onOpenModalVersion()}
                >
                  v{localVersion}
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
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
