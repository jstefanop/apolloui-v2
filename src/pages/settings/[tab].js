import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Flex,
  Button,
  Spinner,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { PoolIcon } from '../../components/UI/Icons/PoolIcon';
import { MinerIcon } from '../../components/UI/Icons/MinerIcon';
import { NodeIcon } from '../../components/UI/Icons/NodeIcon';
import { SystemIcon } from '../../components/UI/Icons/SystemIcon';
import { MdSettings, MdHistory } from 'react-icons/md';
import { GrUserWorker } from 'react-icons/gr';
import { GET_SETTINGS_QUERY, SET_SETTINGS_QUERY } from '../../graphql/settings';
import { GET_POOLS_QUERY, UPDATE_POOLS_QUERY } from '../../graphql/pools';
import { MINER_RESTART_QUERY } from '../../graphql/miner';
import {
  NODE_STOP_QUERY,
  NODE_FORMAT_QUERY,
} from '../../graphql/node';
import { sendFeedback } from '../../redux/slices/feedbackSlice';
import { SettingsProvider } from '../../components/settings/context/SettingsContext';
import PoolsTab from '../../components/settings/tabs/PoolsTab';
import MinerTab from '../../components/settings/tabs/MinerTab';
import SoloTab from '../../components/settings/tabs/SoloTab';
import NodeTab from '../../components/settings/tabs/NodeTab';
import SystemTab from '../../components/settings/tabs/SystemTab';
import ExtraTab from '../../components/settings/tabs/ExtraTab';
import LogsTab from '../../components/settings/tabs/LogsTab';
import ModalRestore from '../../components/apollo/ModalRestore';
import ModalFormat from '../../components/apollo/ModalFormat';
import ModalConnectNode from '../../components/apollo/ModalConnectNode';
import _ from 'lodash';
import moment from 'moment';
import {
  isValidBitcoinAddress,
  isCompatibleBitcoinAddress,
} from '../../lib/utils';
import { mcuSelector } from '../../redux/reselect/mcu';
import { CHANGE_PASSWORD_QUERY } from '../../graphql/auth';
import { useDeviceType } from '../../contexts/DeviceConfigContext';

const RESTORABLE_SETTINGS_FIELDS = [
  'agree',
  'minerMode',
  'voltage',
  'frequency',
  'fan_low',
  'fan_high',
  'apiAllow',
  'customApproval',
  'connectedWifi',
  'leftSidebarVisibility',
  'leftSidebarExtended',
  'rightSidebarVisibility',
  'temperatureUnit',
  'powerLedOff',
  'nodeEnableTor',
  'nodeUserConf',
  'nodeEnableSoloMining',
  'nodeMaxConnections',
  'nodeAllowLan',
  'btcsig',
  'startdiff',
  'mindiff',
  'nodeSoftware',
];

const SettingsTab = () => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const router = useRouter();
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({ initial: true });
  const [currentSettings, setCurrentSettings] = useState();
  const [restoreData, setRestoreData] = useState();
  const [isChanged, setIsChanged] = useState(false);
  const [restartNeeded, setRestartNeeded] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [isModalRestoreOpen, setIsModalRestoreOpen] = useState(false);
  const [isModalFormatOpen, setIsModalFormatOpen] = useState(false);
  const [isModalConnectOpen, setIsModalConnectOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [browserHostname, setBrowserHostname] = useState(null);

  useEffect(() => {
    setBrowserHostname(window.location.hostname);
  }, []);

  // Get the current tab from the URL
  const { tab } = router.query;
  
  // Define tab mapping based on device type
  const tabMapping = deviceType === 'solo-node' ? {
    'solo': 0,
    'node': 1,
    'system': 2,
    'logs': 3,
    'extra': 4
  } : {
    'pools': 0,
    'miner': 1,
    'node': 2,
    'system': 3,
    'logs': 4,
    'extra': 5
  };

  // Get current tab index from URL
  const currentTabIndex = tabMapping[tab] || 0;

  // Mcu data from Redux
  const { data: dataMcu } = useSelector(mcuSelector, shallowEqual);
  const { network } = dataMcu || {};

  // Calculate node address for connection modal
  const eth0 = network ? _.find(network, { name: 'eth0' }) : null;
  const wlan0 = network ? _.find(network, { name: 'wlan0' }) : null;
  const localAddress = wlan0?.address || eth0?.address;
  const rpcHost = browserHostname || localAddress;
  const formattedRpcHost =
    rpcHost?.includes(':') && !rpcHost.startsWith('[') ? `[${rpcHost}]` : rpcHost;
  const nodeAddress = formattedRpcHost
    ? `${formattedRpcHost}:8332`
    : 'Unavailable';

  // Queries
  const {
    loading: loadingSettings,
    error: errorQuerySettings,
    data: dataSettings,
    refetch: refetchSettings,
  } = useQuery(GET_SETTINGS_QUERY);

  const {
    loading: loadingPools,
    error: errorQueryPools,
    data: dataPools,
    refetch: refetchPools,
  } = useQuery(GET_POOLS_QUERY);

  const [saveSettings, { loading: loadingSave }] = useLazyQuery(
    SET_SETTINGS_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [savePools, { loading: loadingSavePools }] = useLazyQuery(
    UPDATE_POOLS_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [restartMiner, { loading: loadingMinerRestart }] = useLazyQuery(
    MINER_RESTART_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [stopNode, { loading: loadingNodeStop }] = useLazyQuery(
    NODE_STOP_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [formatDisk, { loading: loadingFormat }] = useLazyQuery(
    NODE_FORMAT_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [changeLockPassword, { loading: changeLockPasswordLoading }] =
    useLazyQuery(CHANGE_PASSWORD_QUERY, { fetchPolicy: 'no-cache' });

  // Handle tab change
  const handleTabChange = (index) => {
    const tabNames = deviceType === 'solo-node' 
      ? ['solo', 'node', 'system', 'logs', 'extra']
      : ['pools', 'miner', 'node', 'system', 'logs', 'extra'];
    const newTab = tabNames[index];
    router.push(`/settings/${newTab}`);
  };

  // Load initial settings
  useEffect(() => {
    if (
      loadingSettings ||
      loadingPools ||
      errorQuerySettings ||
      errorQueryPools
    )
      return;

    const {
      Pool: {
        list: {
          error: errorPools,
          result: { pools: poolsData },
        },
      },
    } = dataPools;

    const {
      Settings: {
        read: {
          error: errorSettings,
          result: { settings: settingsData },
        },
      },
    } = dataSettings;

    // Use the first pool if it exists, otherwise create a default empty pool
    const poolToUse = poolsData && poolsData.length > 0 
      ? poolsData[0] 
      : {
          enabled: true,
          url: deviceType === 'solo-node' ? 'stratum+tcp://127.0.0.1:3333' : '',
          username: '',
          password: 'x',
          index: 1,
        };

    const finalSettings = { ...settingsData, pool: poolToUse };
    setSettings(finalSettings);
    setCurrentSettings(finalSettings);
  }, [
    loadingSettings,
    loadingPools,
    dataSettings,
    dataPools,
    errorQuerySettings,
    errorQueryPools,
    deviceType,
  ]);

  // Detect changes and restart needs
  useEffect(() => {
    const restartMinerFields = [
      'minerMode',
      'frequency',
      'voltage',
      'pool',
      'fan_low',
      'fan_high',
      'powerLedOff',
      'nodeEnableSoloMining',
    ];
    const restartNodeFields = [
      'nodeEnableTor',
      'nodeUserConf',
      'nodeMaxConnections',
      'nodeAllowLan',
      'nodeSoftware',
      'nodeEnableSoloMining',
    ];
    const isEqual = _.isEqual(settings, currentSettings);
    
    // For solo-node, check solo fields instead of miner fields
    const restartMinerNeeded = deviceType === 'solo-node' 
      ? false 
      : !_.isEqual(
          _.pick(settings, restartMinerFields),
          _.pick(currentSettings, restartMinerFields)
        );
    
    const restartNodeNeeded = !_.isEqual(
      _.pick(settings, restartNodeFields),
      _.pick(currentSettings, restartNodeFields)
    );
    
    const restartType =
      restartMinerNeeded && restartNodeNeeded
        ? 'both'
        : restartMinerNeeded
        ? 'miner'
        : restartNodeNeeded
        ? 'node'
        : null;
    
    if (!isEqual && !settings.initial) setIsChanged(true);
    if (isEqual) setIsChanged(false);
    setRestartNeeded(restartType);
  }, [settings, currentSettings, deviceType]);

  // Handle backup download
  const handleBackup = async () => {
    try {
      const [settingsResponse, poolsResponse] = await Promise.all([
        refetchSettings(),
        refetchPools(),
      ]);
      const settingsRead = settingsResponse.data?.Settings?.read;
      const poolsList = poolsResponse.data?.Pool?.list;
      if (settingsRead?.error) throw new Error(settingsRead.error.message);
      if (poolsList?.error) throw new Error(poolsList.error.message);
      if (!settingsRead?.result?.settings || !poolsList?.result?.pools) {
        throw new Error('Backup data is incomplete');
      }
      const freshBackup = {
        settings: settingsRead.result.settings,
        pools: poolsList.result.pools,
      };

      const blob = new Blob([JSON.stringify(freshBackup)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apollo_backup_${moment().format(
        'YYYY-MM-DD_HH-mm-ss'
      )}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch(
        sendFeedback({
          message: 'Downloading backup file, keep it safe!',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  // Handle restore
  const handleRestoreBackup = async () => {
    try {
      setIsSaving(true);

      if (
        !restoreData ||
        typeof restoreData.settings !== 'object' ||
        restoreData.settings === null ||
        !Array.isArray(restoreData.pools)
      ) {
        throw new Error('Invalid Apollo backup file');
      }
      const { pools, settings } = restoreData;
      // Credentials are appliance-owned runtime state and are never restored
      // from either current or legacy backup files.
      const safeSettings = _.pick(settings, RESTORABLE_SETTINGS_FIELDS);
      const safePools = pools.map((pool) => _.omit(pool, ['__typename']));

      const settingsResult = await saveSettings({
        variables: { input: safeSettings },
      });
      const settingsError = settingsResult?.data?.Settings?.update?.error;
      if (settingsError) throw new Error(settingsError.message);

      const poolsResult = await savePools({
        variables: { input: { pools: safePools } },
      });
      const poolsError = poolsResult?.data?.Pool?.updateAll?.error;
      if (poolsError) throw new Error(poolsError.message);
      await refetchSettings();
      await refetchPools();
      setIsModalRestoreOpen(false);
      dispatch(
        sendFeedback({
          message:
            'Restore complete. Node services were updated automatically; restart your miner if its pool changed.',
          type: 'success',
        })
      );

      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  // Handle format disk
  const handleFormatDisk = async () => {
    try {
      setIsSaving(true);

      const stopResult = await stopNode();
      const stopError = stopResult?.data?.Node?.stop?.error;
      if (stopError) throw new Error(stopError.message);

      const formatResult = await formatDisk();
      const formatError = formatResult?.data?.Node?.format?.error;
      if (formatError) throw new Error(formatError.message);
      dispatch(
        sendFeedback({
          message: 'Formatting disk started...',
          type: 'info',
        })
      );

      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setSettings(currentSettings);
    setErrorForm(null);
  };

  // Handle save settings
  const handleSaveSettings = async (type) => {
    setIsSaving(true);
    setErrorForm(null);
    try {
      // Extract values from settings
      const {
        agree,
        minerMode,
        voltage,
        frequency,
        fan_low,
        fan_high,
        apiAllow,
        customApproval,
        temperatureUnit,
        nodeEnableTor,
        nodeUserConf,
        nodeEnableSoloMining,
        nodeMaxConnections,
        nodeAllowLan,
        nodeSoftware,
        powerLedOff,
        pool,
        btcsig,
        startdiff,
        mindiff,
      } = settings;

      // Ensure pool exists with default values
      const poolData = pool || {};
      const { enabled, url, username, password, index } = poolData;

      // Additional check for required pool fields
      if (!url) {
        setIsSaving(false);
        return setErrorForm('Pool URL is required');
      }

      if (!username) {
        setIsSaving(false);
        return setErrorForm('Pool username/wallet address is required');
      }

      // Validations
      if (!url.match(/^(stratum\+tcp:\/\/)?[a-zA-Z0-9.-]+:[0-9]+$/)) {
        setIsSaving(false);
        return setErrorForm('Invalid pool URL');
      }

      // Additional validation for solo mining
      if (nodeEnableSoloMining) {
        if (!isValidBitcoinAddress(username)) {
          setIsSaving(false);
          return setErrorForm('Invalid Bitcoin address for solo mining');
        }

        if (!isCompatibleBitcoinAddress(username)) {
          setIsSaving(false);
          return setErrorForm(
            'P2WSH and P2TR Bitcoin addresses are not valid for solo mining'
          );
        }
      }

      // Prepare inputs
      const fullInput = {
        agree,
        minerMode,
        voltage,
        frequency,
        fan_low,
        fan_high,
        apiAllow,
        customApproval,
        temperatureUnit,
        nodeEnableTor,
        nodeUserConf,
        nodeEnableSoloMining,
        nodeMaxConnections,
        nodeAllowLan,
        nodeSoftware,
        powerLedOff,
        btcsig,
        startdiff,
        mindiff,
      };
      const input = _.pickBy(
        fullInput,
        (value, key) => !_.isEqual(value, currentSettings?.[key])
      );

      const poolInput = {
        enabled: enabled !== undefined ? enabled : true, // Default to true if not set
        url,
        username,
        password,
        index: index !== undefined ? index : 1, // Default to 1 if not set
      };

      // Submit only fields changed in this editor so a stale tab cannot
      // overwrite unrelated settings saved elsewhere.
      if (Object.keys(input).length > 0) {
        const settingsResult = await saveSettings({ variables: { input } });
        if (settingsResult?.data?.Settings?.update?.error) {
          setIsSaving(false);
          return setErrorForm(settingsResult.data.Settings.update.error.message);
        }
      }

      const currentPool = _.pick(currentSettings?.pool || {}, [
        'enabled',
        'url',
        'username',
        'password',
        'index',
      ]);
      if (!_.isEqual(poolInput, currentPool)) {
        const poolsResult = await savePools({
          variables: { input: { pools: [poolInput] } },
        });
        const poolsError = poolsResult?.data?.Pool?.updateAll?.error;
        if (poolsError) {
          setIsSaving(false);
          return setErrorForm(poolsError.message);
        }
      }

      // Handle password change if needed
      if (
        settings.lockPassword &&
        settings.verifyLockpassword &&
        settings.lockPassword === settings.verifyLockpassword
      ) {
        console.log('Changing password');
        const passwordResult = await changeLockPassword({
          variables: { input: { password: settings.lockPassword } },
        });
        const passwordError =
          passwordResult?.data?.Auth?.changePassword?.error;
        if (passwordError) throw new Error(passwordError.message);
        setIsChanged(false);
      }

      await refetchSettings();
      await refetchPools();

      // Handle restarts based on type
      if (type === 'miner') {
        const restartResult = await restartMiner();
        const restartError = restartResult?.data?.Miner?.restart?.error;
        if (restartError) throw new Error(restartError.message);
        dispatch(
          sendFeedback({ message: 'Restarting miner...', type: 'info' })
        );
      } else if (type === 'node') {
        dispatch(
          sendFeedback({
            message: 'Node configuration applied.',
            type: 'success',
          })
        );
      } else if (type === 'both') {
        const restartResult = await restartMiner();
        const restartError = restartResult?.data?.Miner?.restart?.error;
        if (restartError) throw new Error(restartError.message);
        dispatch(
          sendFeedback({
            message: 'Node configuration applied; restarting miner...',
            type: 'info',
          })
        );
      } else {
        dispatch(sendFeedback({ message: 'Settings saved.', type: 'success' }));
      }

      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  // Determine if saving is in progress
  const isSavingInProgress =
    isSaving ||
    loadingSave ||
    loadingSavePools ||
    loadingMinerRestart ||
    loadingNodeStop ||
    changeLockPasswordLoading;

  // Errors
  if (errorQuerySettings || errorQueryPools) {
    return (
      <Alert borderRadius="8px" status="error" variant="subtle">
        <Flex>
          <AlertIcon />
          <Flex direction="column">
            <AlertTitle mr="12px">Error</AlertTitle>
            <AlertDescription>
              {errorQuerySettings?.toString() || errorQueryPools?.toString()}
            </AlertDescription>
          </Flex>
        </Flex>
      </Alert>
    );
  }

  return (
    <Box>
      <Head>
        <title>{intl.formatMessage({ id: 'settings.title' })}</title>
      </Head>

      <ModalRestore
        isOpen={isModalRestoreOpen}
        onClose={() => setIsModalRestoreOpen(false)}
        onUpload={setRestoreData}
        onRestore={handleRestoreBackup}
        isLoading={isSaving}
      />

      <ModalFormat
        isOpen={isModalFormatOpen}
        onClose={() => setIsModalFormatOpen(false)}
        onFormat={handleFormatDisk}
        isLoading={isSaving}
      />

      {isModalConnectOpen && (
        <ModalConnectNode
          isOpen={isModalConnectOpen}
          onClose={() => setIsModalConnectOpen(false)}
          address={nodeAddress}
        />
      )}

      {/* Save/Discard Changes Bar */}
      {isChanged && (
        <Box
          position="fixed"
          bg="brand.500"
          backgroundPosition="center"
          backgroundSize="cover"
          p="15px"
          mx="auto"
          right="0px"
          bottom={{ base: '0px' }}
          w={{
            base: '100%',
            xl: 'calc(100vw - 215px)',
          }}
          zIndex="1"
        >
          <Flex direction="row" justify="space-between">
            <Button
              colorScheme={'gray'}
              variant={'solid'}
              size={'md'}
              onClick={handleDiscardChanges}
              isDisabled={isSavingInProgress}
            >
              {intl.formatMessage({ id: 'settings.actions.discard' })}
            </Button>
            <Flex direction="row">
              {restartNeeded && (
                <Button
                  colorScheme="orange"
                  variant={'solid'}
                  size={'md'}
                  mr="4"
                  isDisabled={errorForm || isSavingInProgress}
                  onClick={() => handleSaveSettings(restartNeeded)}
                  isLoading={isSavingInProgress}
                  loadingText={intl.formatMessage({ id: 'settings.actions.saving' })}
                >
                  {intl.formatMessage({ id: 'settings.actions.save_restart' })}
                </Button>
              )}
              {!restartNeeded && (
                <Button
                  colorScheme="green"
                  variant={'solid'}
                  size={'md'}
                  isDisabled={errorForm || isSavingInProgress}
                  onClick={() => handleSaveSettings()}
                  isLoading={isSavingInProgress}
                  loadingText={intl.formatMessage({ id: 'settings.actions.saving' })}
                >
                  {intl.formatMessage({ id: 'settings.actions.save' })}
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>
      )}

      <SettingsProvider
        value={{
          settings,
          setSettings,
          errorForm,
          setErrorForm,
          isChanged,
          setIsChanged,
          handleBackup,
          handleRestoreBackup,
          handleFormatDisk,
          handleDiscardChanges,
          handleSaveSettings,
          setIsModalRestoreOpen,
          setIsModalFormatOpen,
          setIsModalConnectOpen,
        }}
      >
        <Box minH="calc(100vh - 80px)" pb={isChanged ? "80px" : "0"}>
          <Tabs
            size="md"
            isLazy
            variant={'line'}
            index={currentTabIndex}
            onChange={handleTabChange}
          >
            <Box overflowX="auto" css={{
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}>
              <TabList>
                {deviceType === 'solo-node' && (
                  <Tab>
                    <Flex align="center" gap="10px">
                      <GrUserWorker />
                      <Text>{intl.formatMessage({ id: 'settings.tabs.solo' })}</Text>
                    </Flex>
                  </Tab>
                )}
                {deviceType !== 'solo-node' && (
                  <Tab>
                    <Flex align="center" gap="10px">
                      <PoolIcon />
                      <Text>{intl.formatMessage({ id: 'settings.tabs.pools' })}</Text>
                    </Flex>
                  </Tab>
                )}
                {deviceType !== 'solo-node' && (
                  <Tab>
                    <Flex align="center" gap="10px">
                      <MinerIcon />
                      <Text>{intl.formatMessage({ id: 'settings.tabs.miner' })}</Text>
                    </Flex>
                  </Tab>
                )}
                <Tab>
                  <Flex align="center" gap="10px">
                    <NodeIcon />
                    <Text>{intl.formatMessage({ id: 'settings.tabs.node' })}</Text>
                  </Flex>
                </Tab>
                <Tab>
                  <Flex align="center" gap="10px">
                    <SystemIcon />
                    <Text>{intl.formatMessage({ id: 'settings.tabs.system' })}</Text>
                  </Flex>
                </Tab>
                <Tab>
                  <Flex align="center" gap="10px">
                    <MdHistory />
                    <Text>{intl.formatMessage({ id: 'settings.tabs.logs' })}</Text>
                  </Flex>
                </Tab>
                <Tab>
                  <Flex align="center" gap="10px">
                    <MdSettings />
                    <Text>{intl.formatMessage({ id: 'settings.tabs.extra' })}</Text>
                  </Flex>
                </Tab>
              </TabList>
            </Box>

            {errorForm && (
              <Alert my="5" borderRadius={'10px'} status={'error'}>
                <AlertIcon />
                <AlertDescription>{errorForm}</AlertDescription>
              </Alert>
            )}

            <TabPanels>
              {deviceType === 'solo-node' && (
                <TabPanel>
                  <SoloTab />
                </TabPanel>
              )}
              {deviceType !== 'solo-node' && (
                <TabPanel>
                  <PoolsTab />
                </TabPanel>
              )}
              {deviceType !== 'solo-node' && (
                <TabPanel>
                  <MinerTab />
                </TabPanel>
              )}
              <TabPanel>
                <NodeTab />
              </TabPanel>
              <TabPanel>
                <SystemTab />
              </TabPanel>
              <TabPanel>
                <LogsTab />
              </TabPanel>
              <TabPanel>
                <ExtraTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </SettingsProvider>
    </Box>
  );
};

export default SettingsTab;
