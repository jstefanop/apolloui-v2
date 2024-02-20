import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Divider,
  Textarea,
  FormLabel,
  Input,
  Flex,
  Grid,
  GridItem,
  FormControl,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
} from '@chakra-ui/react';

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { useLazyQuery, useQuery } from '@apollo/client';
import { IoLeaf, IoRocket } from 'react-icons/io5';
import { FaBalanceScale } from 'react-icons/fa';
import { RiUserSettingsFill } from 'react-icons/ri';
import { MdHdrAuto, MdShield, MdSettings, MdOutlineWifi } from 'react-icons/md';
import SimpleSwitchSettingsItem from '../components/UI/SimpleSwitchSettingsItem';
import PanelCard from '../components/UI/PanelCard';
import SimpleCard from '../components/UI/SimpleCard';
import WifiSettingsCard from '../components/UI/WifiSettingsCard';
import { MCU_WIFI_SCAN_QUERY } from '../graphql/mcu';
import { GET_SETTINGS_QUERY, SET_SETTINGS_QUERY } from '../graphql/settings';
import { GET_POOLS_QUERY, UPDATE_POOLS_QUERY } from '../graphql/pools';
import { MINER_RESTART_QUERY } from '../graphql/miner';
import { CHANGE_PASSWORD_QUERY } from '../graphql/auth';
import { KeyIcon } from '../components/UI/Icons/KeyIcon';
import { MinerIcon } from '../components/UI/Icons/MinerIcon';
import { FanIcon } from '../components/UI/Icons/FanIcon';
import { PoolIcon } from '../components/UI/Icons/PoolIcon';
import { NodeIcon } from '../components/UI/Icons/NodeIcon';
import { DownloadIcon } from '../components/UI/Icons/DownloadIcon';
import { RestoreIcon } from '../components/UI/Icons/RestoreIcon';
import { FormatIcon } from '../components/UI/Icons/FormatIcon';
import Card from '../components/card/Card';
import moment from 'moment';
import ModalRestore from '../components/apollo/ModalRestore';
import { sendFeedback } from '../redux/actions/feedback';
import ModalFormat from '../components/apollo/ModalFormat';
import { NODE_FORMAT_QUERY } from '../graphql/node';
import { NODE_STOP_QUERY } from '../graphql/node';
import { isValidBitcoinAddress } from '../lib/utils';

const Settings = () => {
  const dispatch = useDispatch();
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenFormat,
    onOpen: onOpenFormat,
    onClose: onCloseFormat,
  } = useDisclosure();

  const { current: minerInitialModes } = useRef([
    {
      id: 'eco',
      icon: IoLeaf,
      color: 'brand',
      title: 'ECO',
      selected: false,
      description:
        'In ECO mode your miner will be at its most efficient, but its hashrate will be slightly slower. This mode is recommended, and will produce the least amount of noise and heat.',
    },
    {
      id: 'balanced',
      color: 'brand',
      icon: FaBalanceScale,
      title: 'BALANCED',
      selected: false,
      description:
        'BALANCED mode is a good compromise between hashrate, efficiency, and noise.',
    },
    {
      id: 'turbo',
      color: 'brand',
      icon: IoRocket,
      title: 'TURBO',
      selected: false,
      description:
        'In TURBO mode your miner will be the least efficient, but its hashrate will be the highest. This mode is only recommended for expert users, and you should monitor your miner for possible overheating. The fan can get loud in this mode.',
    },
    {
      id: 'custom',
      color: 'brand',
      icon: RiUserSettingsFill,
      title: 'CUSTOM',
      alertBadge: 'WARNING',
      selected: false,
      description:
        'The Apollo comes with tuned preset values (above), which offer a good range of operating modes. By selecting custom you risk damaging your device and FutureBit will not be responsible for any or all damage caused by over-clocking or over-volting',
      sliders: [
        {
          id: 'voltage',
          title: 'Power',
          description:
            'You can set your miner custom power or reset to default value.',
          min: 30,
          max: 95,
          step: 1,
          data: {
            30: 'Min',
            40: '40%',
            50: '50%',
            60: '60%',
            70: '70%',
            80: '80%',
            90: '90%',
            95: 'Max',
          },
        },
        {
          id: 'frequency',
          title: 'Frequency',
          description:
            'You can set your miner custom frequency or reset to default value.',
          min: 25,
          max: 60,
          step: 1,
          data: {
            25: 'Min',
            32: '32',
            39: '39',
            46: '46',
            53: '53',
            60: 'Max',
          },
        },
      ],
    },
  ]);

  const fanInitialMode = {
    id: 'fan',
    color: 'green',
    icon: MdHdrAuto,
    title: 'AUTO',
    selected: false,
    fan_low: 0,
    fan_high: 0,
    description:
      'The Apollo comes with auto tuned fan speed, but you can set a custom curve by toggling auto to off.',
    sliders: [
      {
        id: 'fan_low',
        title: 'Temperature to start fan',
        description: 'This is the temperature needed to start the fan.',
        min: 40,
        max: 70,
        steps: 5,
        data: {
          40: 'Min',
          50: '50°c',
          60: '60°c',
          70: 'Max',
        },
      },
      {
        id: 'fan_high',
        title: 'Temperature for max fan speed',
        description:
          'This is the temperature needed to set the fan at maximum speed.',
        min: 60,
        max: 90,
        steps: 5,
        data: {
          60: 'Min',
          70: '70°c',
          80: '80°c',
          90: 'Max',
        },
      },
    ],
  };

  const nodeTorInitialMode = {
    id: 'tor',
    color: 'green',
    icon: MdShield,
    title: 'TOR mode',
    selected: false,
    description:
      'Connect your Bitcoin Node over the Tor network to increase security and anonymity. Note: your node will be restarted to apply.',
  };

  const nodeSoloMiningInitialMode = {
    id: 'solo',
    color: 'green',
    icon: MdShield,
    title: 'SOLO Mining mode',
    selected: false,
    description:
      'Enable solo mining mode to mine directly to your own Bitcoin wallet. Note: your node will be restarted to apply.',
  };

  const extraSettingsActions = [
    {
      id: 'backup',
      color: 'blue',
      icon: DownloadIcon,
      title: 'Backup settings',
      buttonTitle: 'BACKUP',
      description:
        'Create a backup file of dashboard, miner and pools configurations',
    },
    {
      id: 'restore',
      color: 'orange',
      icon: RestoreIcon,
      title: 'Restore settings',
      buttonTitle: 'RESTORE',
      description: 'Restore all configurations from a backup file',
    },
    {
      id: 'format',
      color: 'red',
      icon: FormatIcon,
      title: 'Format Node SSD',
      buttonTitle: 'FORMAT',
      description:
        'Use this tool for formatting and setting up your Node NVMe SSD',
    },
  ];

  const [minerModes, setMinerModes] = useState(minerInitialModes);
  const [fanMode, setFanMode] = useState(fanInitialMode);
  const [nodeTorMode, setNodeTorMode] = useState(nodeTorInitialMode);
  const [soloMiningMode, setSoloMiningMode] = useState(
    nodeSoloMiningInitialMode
  );
  const [settings, setSettings] = useState({ initial: true });
  const [currentSettings, setCurrentSettings] = useState();
  const [backupData, setBackupData] = useState();
  const [restoreData, setRestoreData] = useState();
  const [currentMode, setCurrentMode] = useState({ id: 'loading' });
  const [lockPassword, setLockPassword] = useState();
  const [verifyLockpassword, setVerifyLockPassword] = useState();
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [isLockpasswordError, setIsLockpasswordError] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [restartNeeded, setRestartNeeded] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

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

  const [
    handleWifiScan,
    { loading: loadingWifiScan, error: errorWifiScan, data: dataWifiScan },
  ] = useLazyQuery(MCU_WIFI_SCAN_QUERY, { fetchPolicy: 'no-cache' });

  const [saveSettings, { loading: loadingSave, error: errorSave }] =
    useLazyQuery(SET_SETTINGS_QUERY, { fetchPolicy: 'no-cache' });

  const [savePools, { loading: loadingSavePools, error: errorSavePools }] =
    useLazyQuery(UPDATE_POOLS_QUERY, { fetchPolicy: 'no-cache' });

  const [formatDisk, { loading: loadingFormat, error: errorFormat }] =
    useLazyQuery(NODE_FORMAT_QUERY, { fetchPolicy: 'no-cache' });

  const [
    changeLockPassword,
    { loading: changeLockPasswordLoading, error: errorChangeLockPassword },
  ] = useLazyQuery(CHANGE_PASSWORD_QUERY, { fetchPolicy: 'no-cache' });

  const [
    restartMiner,
    { loading: loadingMinerRestart, error: errorMinerRestart },
  ] = useLazyQuery(MINER_RESTART_QUERY, { fetchPolicy: 'no-cache' });

  const [stopNode, { loading: loadingNodeRestart, error: errorNodeRestart }] =
    useLazyQuery(NODE_STOP_QUERY, { fetchPolicy: 'no-cache' });

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

    setCurrentMode(_.find(minerInitialModes, { id: settingsData.minerMode }));
    setMinerModes(
      _.map(minerInitialModes, (mode) => {
        if (mode.id === settingsData.minerMode) mode.selected = true;
        else mode.selected = false;

        if (mode.id === 'custom') {
          mode.frequency = settingsData.frequency;
          mode.voltage = settingsData.voltage;
        }
        return mode;
      })
    );

    setFanMode((el) => {
      return {
        ...el,
        selected: settingsData.fan_low !== 40 || settingsData.fan_high !== 60,
        fan_low: settingsData.fan_low,
        fan_high: settingsData.fan_high,
      };
    });

    setNodeTorMode((el) => {
      return {
        ...el,
        selected: settingsData.nodeEnableTor,
      };
    });

    setSoloMiningMode((el) => {
      return {
        ...el,
        selected: settingsData.nodeEnableSoloMining,
      };
    });
  }, [
    loadingSettings,
    loadingPools,
    dataSettings,
    dataPools,
    minerInitialModes,
    errorQuerySettings,
    errorQueryPools,
  ]);

  // Trigger any change in settings to display the buttons
  useEffect(() => {
    const restartMinerFields = [
      'minerMode',
      'frequency',
      'voltage',
      'pool',
      'fan_low',
      'fan_high',
    ];
    const restartNodeFields = ['nodeEnableTor', 'nodeUserConf'];
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

  const handlePoolChange = (e) => {
    setErrorForm(null);

    if (!e.target.value)
      return setErrorForm(`Field ${e.target.name} can't be empty`);

    const poolChanged = {
      ...settings.pool,
    };

    poolChanged[e.target.name] = e.target.value;

    setSettings({
      ...settings,
      nodeEnableSoloMining: false,
      pool: poolChanged,
    });
  };

  const handleSoloMiningChange = (e) => {
    setErrorForm(null);
    if (!e.target.value) setErrorForm(`Field ${e.target.name} can't be empty`);
    if (!isValidBitcoinAddress(e.target.value))
      setErrorForm('Please add a valid Bitcoin address');
    const poolChanged = {
      ...settings.pool,
      url: 'stratum+tcp://127.0.0.1:3333',
      username: e.target.value,
      password: 'x',
    };
    setSettings({
      ...settings,
      nodeEnableSoloMining: true,
      pool: poolChanged,
    });
  };

  const handleSwitchMinerMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setMinerModes(
      _.map(minerModes, (mode) => {
        mode.selected = mode.id === e.target.id ? true : false;
        return mode;
      })
    );
    setSettings({ ...settings, minerMode: e.target.id });
  };

  const handleCustomModeChange = (value, sliderId) => {
    setErrorForm(null);
    setMinerModes(
      _.map(minerModes, (mode) => {
        if (mode.id === 'custom') mode[sliderId] = value;
        return mode;
      })
    );
    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = value;
    setSettings(settingsChanges);
  };

  const handleCustomModeReset = (sliderId) => {
    setErrorForm(null);
    const v = sliderId === 'voltage' ? 30 : 25;
    setMinerModes(
      _.map(minerModes, (mode) => {
        if (mode.id === 'custom') mode[sliderId] = v;
        return mode;
      })
    );

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = v;
    setSettings(settingsChanges);
  };

  const handleSwitchFanMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setFanMode({ ...fanMode, selected: !v });
    if (v) {
      setSettings({ ...settings, fan_low: 40, fan_high: 60 });
      setFanMode({ ...fanMode, selected: !v, fan_low: 40, fan_high: 60 });
    }
  };

  const handleCustomFanModeChange = (value, sliderId) => {
    setErrorForm(null);
    const fanCHanges = { ...fanMode };
    fanCHanges[sliderId] = value;
    setFanMode(fanCHanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = value;
    setSettings(settingsChanges);
  };

  const handleCustomFanModeReset = (sliderId) => {
    setErrorForm(null);
    const v = sliderId === 'fan_low' ? 40 : 60;
    const fanCHanges = { ...fanMode };
    fanCHanges[sliderId] = v;
    setFanMode(fanCHanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = v;
    setSettings(settingsChanges);
  };

  const handleSwitchNodeTorMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setNodeTorMode({ ...nodeTorMode, selected: !v });
    setSettings({ ...settings, nodeEnableTor: !v });
  };

  const handleSwitchSoloMiningMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setSoloMiningMode({ ...soloMiningMode, selected: !v });
    setSettings({ ...settings, nodeEnableSoloMining: !v });
  };

  const handleDiscardChanges = () => {
    setSettings(currentSettings);
    setNodeTorMode({ ...nodeTorMode, selected: currentSettings.nodeEnableTor });
    setSoloMiningMode({
      ...soloMiningMode,
      selected: currentSettings.nodeEnableSoloMining,
    });
    setFanMode({
      ...fanMode,
      selected:
        currentSettings.fan_low !== 40 && currentSettings.fan_high !== 60,
      fan_low: currentSettings.fan_low,
      fan_high: currentSettings.fan_high,
    });
    setMinerModes(
      _.map(minerModes, (mode) => {
        if (mode.id === currentSettings.minerMode) mode.selected = true;
        else mode.selected = false;
        return mode;
      })
    );
    setErrorForm(null);
  };

  const handleButtonExtraSettings = async (e) => {
    try {
      if (e.target.id === 'backup') {
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
      } else if (e.target.id === 'restore') {
        onOpen();
      } else if (e.target.id === 'format') {
        onOpenFormat();
      }
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

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
      onClose();
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

  const handleFormatDisk = async () => {
    try {
      await stopNode();
      await formatDisk();
      onCloseFormat();
      dispatch(
        sendFeedback({
          message: 'Format done! Your system is ready.',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  const handlesSaveSettings = async (type) => {
    setErrorForm(null);
    try {
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
        pool,
      } = settings;

      const { enabled, url, username, password, index } = pool;

      if (!url.match(/stratum\+tcp:\/\/(.*):\d+$/))
        return setErrorForm('Invalid pool URL');

      if (nodeEnableSoloMining && !isValidBitcoinAddress(username))
        return setErrorForm('Invalid Bitcoin wallet address');

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
      };

      const poolInput = {
        enabled,
        url,
        username,
        password,
        index,
      };

      await saveSettings({ variables: { input } });
      await savePools({ variables: { input: { pools: [poolInput] } } });
      await refetchSettings();
      await refetchPools();
      if (
        lockPassword &&
        verifyLockpassword &&
        lockPassword === verifyLockpassword
      ) {
        changeLockPassword({
          variables: { input: { password: lockPassword } },
        });
        setIsChanged(false);
      }

      setTabIndex(0);

      if (type === 'miner') {
        await restartMiner();
        dispatch(
          sendFeedback({ message: 'Restarting miner...', type: 'info' })
        );
      } else if (type === 'node') {
        dispatch(
          sendFeedback({
            message: 'You will need to restart your node manually.',
            type: 'orange',
          })
        );
      } else if (type === 'both') {
        await restartMiner();
        dispatch(
          sendFeedback({ message: 'Restarting miner...', type: 'info' })
        );
        dispatch(
          sendFeedback({
            message: 'You will need to restart your node manually.',
            type: 'orange',
          })
        );
      } else {
        dispatch(sendFeedback({ message: 'Settings saved.', type: 'success' }));
      }
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  if (errorQuerySettings || errorQueryPools) {
    return (
      <Alert borderRadius="8px" status="error" variant="subtle">
        <Flex>
          <AlertIcon />
          <Flex direction="column">
            <AlertTitle mr="12px">Error</AlertTitle>
            <AlertDescription>
              {errorQuerySettings.toString() || errorQueryPools.toString()}
            </AlertDescription>
          </Flex>
        </Flex>
      </Alert>
    );
  }

  return (
    <Box>
      <Head>
        <title>Apollo BTC Settings</title>
      </Head>

      <ModalRestore
        isOpen={isOpen}
        onClose={onClose}
        onUpload={setRestoreData}
        onRestore={handleRestoreBackup}
      />

      <ModalFormat
        isOpen={isOpenFormat}
        onClose={onCloseFormat}
        onFormat={handleFormatDisk}
      />

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
                  onClick={() => handlesSaveSettings(restartNeeded)}
                >
                  Save & Restart
                </Button>
              )}
              <Button
                colorScheme="green"
                variant={'solid'}
                size={'md'}
                disabled={errorForm}
                onClick={() => handlesSaveSettings()}
              >
                Save
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      <Tabs
        size="md"
        isLazy
        variant={'line'}
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
      >
        <TabList ml="5">
          <Tab>
            <Text fontWeight={600} me="2">
              Pools
            </Text>
          </Tab>
          <Tab>
            <Text fontWeight={600} me="2">
              Miner
            </Text>
          </Tab>
          <Tab>
            <Text fontWeight={600} me="2">
              Node
            </Text>
          </Tab>
          <Tab>
            <Text fontWeight={600} me="2">
              System
            </Text>
          </Tab>
          <Tab>
            <Text fontWeight={600} me="2">
              Extra
            </Text>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {settings.pool && (
              <SimpleGrid columns={{ base: 1 }} gap="20px" mb="20px">
                {/* POOL SETTINGS */}
                <PanelCard
                  title={'Pool settings'}
                  description={'Manage pools configuration for your miner'}
                  textColor={textColor}
                  icon={PoolIcon}
                >
                  {errorForm && (
                    <Flex px="22px">
                      <Text color="red">{errorForm}</Text>
                    </Flex>
                  )}
                  <Grid templateColumns="repeat(6, 1fr)" gap={2}>
                    <GridItem colSpan={3}>
                      <SimpleCard title={'URL'} textColor={textColor}>
                        <Input
                          color={inputTextColor}
                          name="url"
                          type="text"
                          placeholder={
                            'stratum+tcp://stratum.slushpool.com:3333'
                          }
                          value={settings.pool.url}
                          onChange={handlePoolChange}
                          disabled={soloMiningMode.selected}
                        />
                      </SimpleCard>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <SimpleCard title={'Username'} textColor={textColor}>
                        <Input
                          color={inputTextColor}
                          name="username"
                          type="text"
                          placeholder={'futurebit.worker'}
                          value={settings.pool.username}
                          onChange={handlePoolChange}
                          disabled={soloMiningMode.selected}
                        />
                      </SimpleCard>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <SimpleCard title={'Password'} textColor={textColor}>
                        <Input
                          color={inputTextColor}
                          name="password"
                          type="text"
                          placeholder={'x'}
                          value={settings.pool.password}
                          onChange={handlePoolChange}
                          disabled={soloMiningMode.selected}
                        />
                      </SimpleCard>
                    </GridItem>
                  </Grid>
                  <SimpleSwitchSettingsItem
                    item={soloMiningMode}
                    textColor={textColor}
                    sliderTextColor={sliderTextColor}
                    handleSwitch={handleSwitchSoloMiningMode}
                  />
                  {soloMiningMode.selected && (
                    <SimpleCard title={'Wallet address'} textColor={textColor}>
                      <Input
                        color={inputTextColor}
                        name="wallet"
                        type="text"
                        placeholder={'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                        value={settings.pool.username}
                        onChange={handleSoloMiningChange}
                      />
                    </SimpleCard>
                  )}
                </PanelCard>
              </SimpleGrid>
            )}
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
              {/* MINER MODES */}
              <PanelCard
                title={'Miner modes settings'}
                description={'Manage miner specific configurations'}
                textColor={textColor}
                badgeColor={currentMode.color}
                badgeText={currentMode.id.toUpperCase()}
                icon={MinerIcon}
                mb={'20px'}
              >
                {minerModes.map((mode, index) => {
                  return (
                    <div key={mode.id}>
                      <SimpleSwitchSettingsItem
                        item={mode}
                        textColor={textColor}
                        sliderTextColor={sliderTextColor}
                        handleSwitch={handleSwitchMinerMode}
                        handleCustomModeChange={handleCustomModeChange}
                        handleCustomModeReset={handleCustomModeReset}
                      />
                      {index !== minerModes.length - 1 && <Divider mb="10px" />}
                    </div>
                  );
                })}
              </PanelCard>
              {/* MINER FAN */}
              <PanelCard
                title={'Miner fan settings'}
                description={'Adjust the fan speed or set it to automatic'}
                textColor={textColor}
                icon={FanIcon}
                mb="20px"
              >
                <SimpleSwitchSettingsItem
                  item={fanMode}
                  textColor={textColor}
                  sliderTextColor={sliderTextColor}
                  inverted={true}
                  handleSwitch={handleSwitchFanMode}
                  handleCustomModeChange={handleCustomFanModeChange}
                  handleCustomModeReset={handleCustomFanModeReset}
                />
              </PanelCard>
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
              {/* NODE SETTINGS */}
              <PanelCard
                title={'Bitcoin node settings'}
                description={'Manage Bitcoin Node Configuration'}
                textColor={textColor}
                icon={NodeIcon}
                badgeColor={'orange'}
                badgeText={settings.nodeRpcPassword}
                showHide={true}
                mb={'20px'}
              >
                <SimpleSwitchSettingsItem
                  item={nodeTorMode}
                  textColor={textColor}
                  sliderTextColor={sliderTextColor}
                  handleSwitch={handleSwitchNodeTorMode}
                />
                <Divider mb="10px" />
                <SimpleCard
                  title={'Bitcoin node configuration'}
                  description={
                    'Add additional configuration lines to the bitcoin.conf file. (Note: this section is for advanced users, and no validation is performed. You can add things like ipallow to allow external devices that host wallets etc to connect directly to your node for broadcasting transactions etc.)'
                  }
                  textColor={textColor}
                  icon={MdSettings}
                >
                  <Textarea
                    value={settings.nodeUserConf}
                    onChange={(v) =>
                      setSettings({ ...settings, nodeUserConf: v.target.value })
                    }
                    mt="4"
                  />
                </SimpleCard>
              </PanelCard>
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
              {/* WIFI SETTINGS */}
              <PanelCard
                title={'Wifi settings'}
                description={
                  'Connect your system controller to a Wifi instead using ethernet'
                }
                textColor={textColor}
                icon={MdOutlineWifi}
                buttonText="Scan"
                handleButtonClick={handleWifiScan}
                buttonLoading={loadingWifiScan}
                mb={'20px'}
              >
                <WifiSettingsCard
                  textColor={textColor}
                  loading={loadingWifiScan}
                  error={errorWifiScan}
                  data={dataWifiScan}
                  onScan={handleWifiScan}
                />
              </PanelCard>
              {/* PASSWORD SETTINGS */}
              <PanelCard
                title={'Lockscreen'}
                description={'Change the password to access the dashboard'}
                textColor={textColor}
                icon={KeyIcon}
                mb="20px"
              >
                <SimpleCard textColor={textColor}>
                  <form onSubmit={handlesSaveSettings}>
                    <Flex flexDir={'column'}>
                      <FormControl isRequired>
                        <FormLabel
                          display="flex"
                          ms="4px"
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          mb="8px"
                        >
                          Password
                        </FormLabel>
                        <InputGroup size="md">
                          <Input
                            color={inputTextColor}
                            isRequired={true}
                            fontSize="sm"
                            placeholder="Your lock screen password"
                            mb="24px"
                            size="lg"
                            type={showLockPassword ? 'text' : 'password'}
                            id="password"
                            onChange={(e) => setLockPassword(e.target.value)}
                            isInvalid={isLockpasswordError}
                          />
                          <InputRightElement width="4.5rem">
                            <Button
                              h="1.75rem"
                              size="sm"
                              onClick={() =>
                                setShowLockPassword(!showLockPassword)
                              }
                            >
                              {showLockPassword ? 'Hide' : 'Show'}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel
                          ms="4px"
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          display="flex"
                        >
                          Verify Password
                        </FormLabel>
                        <InputGroup size="md">
                          <Input
                            color={inputTextColor}
                            isRequired={true}
                            fontSize="sm"
                            placeholder="Verify your lock screen password"
                            mb="24px"
                            size="lg"
                            type={showLockPassword ? 'text' : 'password'}
                            id="verifypassword"
                            onChange={(e) =>
                              setVerifyLockPassword(e.target.value)
                            }
                            isInvalid={isLockpasswordError}
                          />
                          <InputRightElement width="4.5rem">
                            <Button
                              h="1.75rem"
                              size="sm"
                              onClick={() =>
                                setShowLockPassword(!showLockPassword)
                              }
                            >
                              {showLockPassword ? 'Hide' : 'Show'}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        {isLockpasswordError && (
                          <Text fontSize={'sm'} color={'red'}>
                            {isLockpasswordError}
                          </Text>
                        )}
                      </FormControl>
                    </Flex>
                  </form>
                </SimpleCard>
              </PanelCard>
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
              {/* EXTRA SETTINGS */}
              {extraSettingsActions.map((action, index) => {
                return (
                  <Card
                    boxShadow="unset"
                    px="24px"
                    py="21px"
                    transition="0.2s linear"
                    key={index}
                  >
                    <Flex justify={'space-between'}>
                      <Box>
                        <Flex>
                          <Icon
                            w="20px"
                            h="20px"
                            as={action.icon}
                            mr="8px"
                            mt="4px"
                          />
                          <Text
                            fontSize="xl"
                            fontWeight="600"
                            color={textColor}
                          >
                            {action.title}
                          </Text>
                        </Flex>
                        <Text
                          fontSize={{ base: 'sm', lg: 'md' }}
                          fontWeight="400"
                          color={'secondaryGray.800'}
                        >
                          {action.description}
                        </Text>
                      </Box>
                      <Button
                        variant={'solid'}
                        colorScheme={action.color}
                        w="200px"
                        id={action.id}
                        onClick={handleButtonExtraSettings}
                      >
                        {action.buttonTitle}
                      </Button>
                    </Flex>
                  </Card>
                );
              })}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;
