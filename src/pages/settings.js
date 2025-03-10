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
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useLazyQuery } from '@apollo/client';
import { PoolIcon } from '../components/UI/Icons/PoolIcon';
import { MinerIcon } from '../components/UI/Icons/MinerIcon';
import { NodeIcon } from '../components/UI/Icons/NodeIcon';
import { SystemIcon } from '../components/UI/Icons/SystemIcon';
import { MdSettings } from 'react-icons/md';
import { GET_SETTINGS_QUERY, SET_SETTINGS_QUERY } from '../graphql/settings';
import { GET_POOLS_QUERY, UPDATE_POOLS_QUERY } from '../graphql/pools';
import { MINER_RESTART_QUERY } from '../graphql/miner';
import {
  NODE_START_QUERY,
  NODE_STOP_QUERY,
  NODE_FORMAT_QUERY,
} from '../graphql/node';
import { sendFeedback } from '../redux/actions/feedback';
import { SettingsProvider } from '../components/settings/context/SettingsContext';
import PoolsTab from '../components/settings/tabs/PoolsTab';
import MinerTab from '../components/settings/tabs/MinerTab';
import NodeTab from '../components/settings/tabs/NodeTab';
import SystemTab from '../components/settings/tabs/SystemTab';
import ExtraTab from '../components/settings/tabs/ExtraTab';
import ModalRestore from '../components/apollo/ModalRestore';
import ModalFormat from '../components/apollo/ModalFormat';
import ModalConnectNode from '../components/apollo/ModalConnectNode';
import _ from 'lodash';
import moment from 'moment';
import { getNodeErrorMessage } from '../lib/utils';
import { nodeSelector } from '../redux/reselect/node';
import { mcuSelector } from '../redux/reselect/mcu';
import { CHANGE_PASSWORD_QUERY } from '../graphql/auth';

const Settings = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({ initial: true });
  const [currentSettings, setCurrentSettings] = useState();
  const [backupData, setBackupData] = useState();
  const [restoreData, setRestoreData] = useState();
  const [isChanged, setIsChanged] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [restartNeeded, setRestartNeeded] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [isModalRestoreOpen, setIsModalRestoreOpen] = useState(false);
  const [isModalFormatOpen, setIsModalFormatOpen] = useState(false);
  const [isModalConnectOpen, setIsModalConnectOpen] = useState(false);
  const [lockPassword, setLockPassword] = useState();
  const [verifyLockpassword, setVerifyLockPassword] = useState();
  const [isLockpasswordError, setIsLockpasswordError] = useState(false);

  // Node data from Redux
  const {
    data: dataNode,
    error: errorNode,
    loading: loadingNode,
  } = useSelector(nodeSelector);
  const { localaddresses } = dataNode || {};
  const { errorSentence: errorNodeSentence } = getNodeErrorMessage(errorNode);

  // Mcu data from Redux
  const { data: dataMcu } = useSelector(mcuSelector);
  const { network } = dataMcu || {};

  // Calculate node address for connection modal
  const eth0 = network ? _.find(network, { name: 'eth0' }) : null;
  const wlan0 = network ? _.find(network, { name: 'wlan0' }) : null;
  const localAddress = wlan0?.address || eth0?.address;

  const nodeAddress =
    localaddresses?.length && settings?.nodeEnableTor
      ? `${localaddresses[0].address}:${localaddresses[0].port}`
      : `${localAddress}:8332`;

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

  const [startNode, { loading: loadingNodeStart }] = useLazyQuery(
    NODE_START_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [formatDisk, { loading: loadingFormat }] = useLazyQuery(
    NODE_FORMAT_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [changeLockPassword, { loading: changeLockPasswordLoading }] =
    useLazyQuery(CHANGE_PASSWORD_QUERY, { fetchPolicy: 'no-cache' });

  // Password validation
  useEffect(() => {
    if (!lockPassword || !verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(false);
    } else if (lockPassword.length < 8) {
      setIsLockpasswordError('The password must have 8 characters at least');
      setIsChanged(false);
    } else if (lockPassword === verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(true);
    } else {
      setIsLockpasswordError('Passwords must match');
      setIsChanged(false);
    }
  }, [lockPassword, verifyLockpassword]);

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

    const finalSettings = { ...settingsData, pool: poolsData[0] };
    setSettings(finalSettings);
    setCurrentSettings(finalSettings);
    setBackupData({ settings: settingsData, pools: poolsData });
  }, [
    loadingSettings,
    loadingPools,
    dataSettings,
    dataPools,
    errorQuerySettings,
    errorQueryPools,
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
    ];
    const isEqual = _.isEqual(settings, currentSettings);
    const restartMinerNeeded = !_.isEqual(
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
        : restartMinerNeeded && !restartNodeNeeded
          ? 'miner'
          : !restartMinerNeeded && restartNodeNeeded
            ? 'node'
            : null;
    if (!isEqual && !settings.initial) setIsChanged(true);
    if (isEqual) setIsChanged(false);
    setRestartNeeded(restartType);
  }, [settings, currentSettings]);

  // Handle backup download
  const handleBackup = async () => {
    try {
      await refetchSettings();
      await refetchPools();

      const blob = new Blob([JSON.stringify(backupData)], {
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
      const { pools, settings } = restoreData;
      delete settings.__typename;
      pools.forEach((element) => {
        delete element.__typename;
      });

      await saveSettings({ variables: { input: settings } });
      await savePools({ variables: { input: { pools } } });
      await refetchSettings();
      await refetchPools();
      setIsModalRestoreOpen(false);
      dispatch(
        sendFeedback({
          message:
            'Restore done! Please remember to restart your miner and node.',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  // Handle format disk
  const handleFormatDisk = async () => {
    try {
      await stopNode();
      await formatDisk();
      dispatch(
        sendFeedback({
          message: 'Formatting disk started...',
          type: 'info',
        })
      );
    } catch (error) {
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
        nodeRpcPassword,
        nodeEnableTor,
        nodeUserConf,
        nodeEnableSoloMining,
        nodeMaxConnections,
        nodeAllowLan,
        powerLedOff,
        pool,
        btcsig,
      } = settings;

      const { enabled, url, username, password, index } = pool;

      // Validations - these should be moved to separate functions or hooks
      if (!url.match(/^(stratum\+tcp:\/\/)?[a-zA-Z0-9.-]+:[0-9]+$/))
        return setErrorForm('Invalid pool URL');

      // Prepare inputs
      const input = {
        agree,
        minerMode,
        voltage,
        frequency,
        fan_low,
        fan_high,
        apiAllow,
        customApproval,
        temperatureUnit,
        nodeRpcPassword,
        nodeEnableTor,
        nodeUserConf,
        nodeEnableSoloMining,
        nodeMaxConnections,
        nodeAllowLan,
        powerLedOff,
        btcsig,
      };

      const poolInput = {
        enabled,
        url,
        username,
        password,
        index,
      };

      // Save settings and pools
      await saveSettings({ variables: { input } });
      await savePools({ variables: { input: { pools: [poolInput] } } });

      // Handle password change if needed
      if (
        lockPassword &&
        verifyLockpassword &&
        lockPassword === verifyLockpassword
      ) {
        await changeLockPassword({
          variables: { input: { password: lockPassword } },
        });
        setIsChanged(false);
      }

      await refetchSettings();
      await refetchPools();

      setTabIndex(0);

      // Handle restarts based on type
      if (type === 'miner') {
        await restartMiner();
        dispatch(
          sendFeedback({ message: 'Restarting miner...', type: 'info' })
        );
      } else if (type === 'node') {
        await stopNode();
        dispatch(
          sendFeedback({
            message: 'Restarting Bitcoin node...',
            type: 'info',
          })
        );
        await startNode();
      } else if (type === 'both') {
        await restartMiner();
        dispatch(
          sendFeedback({ message: 'Restarting miner...', type: 'info' })
        );
        await stopNode();
        dispatch(
          sendFeedback({
            message: 'Restarting Bitcoin node...',
            type: 'info',
          })
        );
        await startNode();
      } else {
        dispatch(sendFeedback({ message: 'Settings saved.', type: 'success' }));
      }
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

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
        <title>Apollo Settings</title>
      </Head>

      <ModalRestore
        isOpen={isModalRestoreOpen}
        onClose={() => setIsModalRestoreOpen(false)}
        onUpload={setRestoreData}
        onRestore={handleRestoreBackup}
      />

      <ModalFormat
        isOpen={isModalFormatOpen}
        onClose={() => setIsModalFormatOpen(false)}
        onFormat={handleFormatDisk}
      />

      <ModalConnectNode
        isOpen={isModalConnectOpen}
        onClose={() => setIsModalConnectOpen(false)}
        pass={settings?.nodeRpcPassword}
        address={nodeAddress}
      />

      {/* Save/Discard Changes Bar */}
      {isChanged && (
        <Box
          position="fixed"
          bg="blue.900"
          backgroundPosition="center"
          backgroundSize="cover"
          p="15px"
          mx="auto"
          right="0px"
          bottom={{ base: '0px' }}
          w={{
            base: '100%',
            xl: 'calc(100vw - 250px)',
          }}
          zIndex="1"
        >
          <Flex direction="row" justify="space-between">
            <Button
              colorScheme={'gray'}
              variant={'solid'}
              size={'md'}
              onClick={handleDiscardChanges}
            >
              Discard changes
            </Button>
            <Flex direction="row">
              {restartNeeded && (
                <Button
                  colorScheme="orange"
                  variant={'solid'}
                  size={'md'}
                  mr="4"
                  disabled={errorForm}
                  onClick={() => handleSaveSettings(restartNeeded)}
                >
                  Save & Restart
                </Button>
              )}
              {!restartNeeded && (
                <Button
                  colorScheme="green"
                  variant={'solid'}
                  size={'md'}
                  disabled={errorForm}
                  onClick={() => handleSaveSettings()}
                >
                  Save
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
          lockPassword,
          setLockPassword,
          verifyLockpassword,
          setVerifyLockPassword,
          isLockpasswordError,
          setIsLockpasswordError,
          setIsModalRestoreOpen,
          setIsModalFormatOpen,
          setIsModalConnectOpen,
        }}
      >
        <Tabs
          size="md"
          isLazy
          variant={'line'}
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
        >
          <TabList ml="5">
            <Tab>
              <Text
                fontWeight={600}
                me="2"
                display={{ base: 'none', md: 'block' }}
              >
                Pools
              </Text>
              <PoolIcon display={{ base: 'block' }} />
            </Tab>
            <Tab>
              <Text
                fontWeight={600}
                me="2"
                display={{ base: 'none', md: 'block' }}
              >
                Miner
              </Text>
              <MinerIcon display={{ base: 'block' }} />
            </Tab>
            <Tab>
              <Text
                fontWeight={600}
                me="2"
                display={{ base: 'none', md: 'block' }}
              >
                Node
              </Text>
              <NodeIcon display={{ base: 'block' }} />
            </Tab>
            <Tab>
              <Text
                fontWeight={600}
                me="2"
                display={{ base: 'none', md: 'block' }}
              >
                System
              </Text>
              <SystemIcon display={{ base: 'block' }} />
            </Tab>
            <Tab>
              <Text
                fontWeight={600}
                me="2"
                display={{ base: 'none', md: 'block' }}
              >
                Extra
              </Text>
              <MdSettings display={{ base: 'block' }} />
            </Tab>
          </TabList>

          {errorForm && (
            <Alert my="5" borderRadius={'10px'} status={'error'}>
              <AlertIcon />
              <AlertDescription>{errorForm}</AlertDescription>
            </Alert>
          )}

          <TabPanels>
            <TabPanel>
              <PoolsTab />
            </TabPanel>
            <TabPanel>
              <MinerTab />
            </TabPanel>
            <TabPanel>
              <NodeTab />
            </TabPanel>
            <TabPanel>
              <SystemTab />
            </TabPanel>
            <TabPanel>
              <ExtraTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </SettingsProvider>
    </Box>
  );
};

export default Settings;
