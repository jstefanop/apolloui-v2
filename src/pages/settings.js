import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Divider,
  Textarea,
  Stack,
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
  InputLeftElement,
} from '@chakra-ui/react';

import React, { useState } from 'react';
import _ from 'lodash';
import { IoLeaf, IoRocket } from 'react-icons/io5';
import { FaBalanceScale, FaGratipay } from 'react-icons/fa';
import { RiUserSettingsFill, RiDatabase2Fill, RiEraserLine } from 'react-icons/ri';
import { BsWind } from 'react-icons/bs';
import {
  MdOutlineWidgets,
  MdHdrAuto,
  MdDeviceHub,
  MdShield,
  MdSettings,
  MdWebAsset,
  MdPerson,
  MdPassword,
  MdOutlineWifi,
  MdVpnKey,
  MdSave,
  MdUploadFile,
  MdOutlineSimCardDownload,
} from 'react-icons/md';
import SimpleSwitchSettingsItem from '../components/UI/SimpleSwitchSettingsItem';
import PanelCard from '../components/UI/PanelCard';
import SimpleCard from '../components/UI/SimpleCard';
import WifiSettingsCard from '../components/UI/WifiSettingsCard';

const Settings = () => {
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const minerSettings = {
    mode: 'balanced',
    voltage: 45,
    frequency: 38,
    fan_low: 40,
    fan_high: 60,
    nodeRpcPassword: 'helloworld',
    nodeEnableTor: false,
    nodeUserConf: null,
    nodeConf: null,
  };

  let minerInitialModes = [
    {
      id: 'eco',
      icon: IoLeaf,
      color: 'green',
      title: 'ECO Mode',
      selected: false,
      description:
        'In ECO mode your miner will be at its most efficient, but its hashrate will be slightly slower. This mode is recommended, and will produce the least amount of noise and heat.',
    },
    {
      id: 'balanced',
      color: 'blue',
      icon: FaBalanceScale,
      title: 'BALANCED Mode',
      selected: false,
      description:
        'BALANCED mode is a good compromise between hashrate, efficiency, and noise.',
    },
    {
      id: 'turbo',
      color: 'orange',
      icon: IoRocket,
      title: 'TURBO Mode',
      selected: false,
      description:
        'In TURBO mode your miner will be the least efficient, but its hashrate will be the highest. This mode is only recommended for expert users, and you should monitor your miner for possible overheating. The fan can get loud in this mode.',
    },
    {
      id: 'custom',
      color: 'red',
      icon: RiUserSettingsFill,
      title: 'CUSTOM Mode',
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
  ];

  const fanInitialMode = {
    id: 'fan',
    color: 'green',
    icon: MdHdrAuto,
    title: 'AUTO',
    selected:
      (minerSettings.fan_low !== 40 && minerSettings.fan_high !== 60) || false,
    fan_low: minerSettings.fan_low,
    fan_high: minerSettings.fan_high,
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
    selected: minerSettings.nodeEnableTor,
    description:
      'Connect your Bitcoin Node over the Tor network to increase security and anonymity. Note: you need to press the Save button on the top of the page after changing settings in this section, and your node will be restarted to apply.',
  };

  const extraSettingsActions = [
    {
      id: 'backup',
      color: 'blue',
      icon: MdUploadFile,
      title: 'Backup settings',
      buttonTitle: 'BACKUP',
      description:
        'Create a backup file of dashboard, miner and pools configurations',
    },
    {
      id: 'restore',
      color: 'blue',
      icon: MdOutlineSimCardDownload,
      title: 'Restore settings',
      buttonTitle: 'RESTORE',
      description:
        'Restore all configurations from a backup file',
    },
    {
      id: 'format',
      color: 'orange',
      icon: RiEraserLine,
      title: 'Format Node SSD',
      buttonTitle: 'FORMAT',
      description:
        'Use this tool for formatting and setting up your Node NVMe SSD',
    },
  ];

  const currentMode = _.find(minerInitialModes, { id: minerSettings.mode });
  minerInitialModes = _.map(minerInitialModes, (mode) => {
    if (mode.id === minerSettings.mode) mode.selected = true;
    if (mode.id === 'custom') {
      mode.frequency = minerSettings.frequency;
      mode.voltage = minerSettings.voltage;
    }
    return mode;
  });

  const [minerModes, setMinerModes] = useState(minerInitialModes);
  const [fanMode, setFanMode] = useState(fanInitialMode);
  const [nodeTorMode, setNodeTorMode] = useState(nodeTorInitialMode);
  const [settings, setSettings] = useState({ ...minerSettings });

  const handleSwitchMinerMode = (e) => {
    const v = e.target.value === 'true' ? true : false;
    setMinerModes(
      _.map(minerModes, (mode) => {
        mode.selected = mode.id === e.target.id ? true : false;
        return mode;
      })
    );
    setSettings({ ...settings, mode: e.target.id });
  };

  const handleCustomModeChange = (value, sliderId) => {
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
    const v = e.target.value === 'true' ? true : false;
    setFanMode({ ...fanMode, selected: !v });
  };

  const handleCustomFanModeChange = (value, sliderId) => {
    const fanCHanges = { ...fanMode };
    fanCHanges[sliderId] = value;
    setFanMode(fanCHanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = value;
    setSettings(settingsChanges);
  };

  const handleCustomFanModeReset = (sliderId) => {
    const v = sliderId === 'fan_low' ? 40 : 60;
    const fanCHanges = { ...fanMode };
    fanCHanges[sliderId] = v;
    setFanMode(fanCHanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = v;
    setSettings(settingsChanges);
  };

  const handleSwitchNodeTorMode = (e) => {
    const v = e.target.value === 'true' ? true : false;
    setNodeTorMode({ ...nodeTorMode, selected: !v });
    setSettings({ ...settings, nodeEnableTor: !v });
  };

  const handleButtonExtraSettings = () => {};

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid columns={{ base: 1 }} gap='20px' mb='20px'>
        {/* POOL SETTINGS */}
        <PanelCard
          title={'Pool settings'}
          description={'Manage pools configuration for your miner'}
          textColor={textColor}
          icon={RiDatabase2Fill}
        >
          <Grid templateColumns='repeat(6, 1fr)' gap={2}>
            <GridItem colSpan={3}>
              <SimpleCard title={'URL'} textColor={textColor} icon={MdWebAsset}>
                <Input
                  name='url'
                  type='text'
                  placeholder={'stratum+tcp://stratum.slushpool.com:3333'}
                />
              </SimpleCard>
            </GridItem>
            <GridItem colSpan={2}>
              <SimpleCard
                title={'Username'}
                textColor={textColor}
                icon={MdPerson}
              >
                <Input
                  name='username'
                  type='text'
                  placeholder={'futurebit.worker'}
                />
              </SimpleCard>
            </GridItem>
            <GridItem colSpan={1}>
              <SimpleCard
                title={'Password'}
                textColor={textColor}
                icon={MdPassword}
              >
                <Input name='password' type='text' placeholder={'x'} />
              </SimpleCard>
            </GridItem>
          </Grid>
        </PanelCard>
      </SimpleGrid>

      <Grid
        templateRows={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        gap='20px'
        mb='20px'
      >
        <GridItem rowSpan={2} colSpan={1}>
          {/* MINER MODES */}
          <PanelCard
            title={'Miner modes settings'}
            description={'Manage miner specific configurations'}
            textColor={textColor}
            badgeColor={currentMode.color}
            badgeText={currentMode.id.toUpperCase()}
            icon={MdOutlineWidgets}
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
                  {index !== minerModes.length - 1 && <Divider mb='10px' />}
                </div>
              );
            })}
          </PanelCard>

          {/* WIFI SETTINGS */}
          <PanelCard
            title={'Wifi settings'}
            description={
              'Connect your system controller to a Wifi instead using ethernet'
            }
            textColor={textColor}
            icon={MdOutlineWifi}
            badgeText={'FutureBitWifi'}
            badgeColor={'green'}
            tooltip={'You are connected to this network'}
            mb={'20px'}
          >
            <WifiSettingsCard textColor={textColor} />
          </PanelCard>

          {/* EXTRA SETTINGS */}
          <PanelCard
            title={'Extra settings'}
            description={
              'Backup, restore, reset configurations and format disk'
            }
            textColor={textColor}
            icon={MdSave}
            mb='20px'
          >
            {extraSettingsActions.map((action, index) => {
              return (
                <SimpleSwitchSettingsItem key={index}
                  item={action}
                  textColor={textColor}
                  handleButton={handleButtonExtraSettings}
                />
              );
            })}
          </PanelCard>
        </GridItem>

        <GridItem rowSpan={2} colSpan={1}>
          {/* MINER FAN */}
          <PanelCard
            title={'Miner fan settings'}
            description={'Adjust the fan speed or set it to automatic'}
            textColor={textColor}
            icon={BsWind}
            mb='20px'
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

          {/* NODE SETTINGS */}
          <PanelCard
            title={'Bitcoin node settings'}
            description={'Manage Bitcoin Node Configuration'}
            textColor={textColor}
            icon={MdDeviceHub}
            badgeColor={'orange'}
            badgeText={minerSettings.nodeRpcPassword}
            showHide={true}
            mb={'20px'}
          >
            <SimpleSwitchSettingsItem
              item={nodeTorMode}
              textColor={textColor}
              sliderTextColor={sliderTextColor}
              handleSwitch={handleSwitchNodeTorMode}
            />
            <Divider mb='10px' />
            <SimpleCard
              title={'Bitcoin node configuration'}
              description={
                'Add additional configuration lines to the bitcoin.conf file. (Note: this section is for advanced users, and no validation is performed. You can add things like ipallow to allow external devices that host wallets etc to connect directly to your node for broadcasting transactions etc.)'
              }
              textColor={textColor}
              icon={MdSettings}
            >
              <Textarea
                onChange={(v) =>
                  setSettings({ ...settings, nodeUserConf: v.target.value })
                }
                mt='4'
              />
            </SimpleCard>
          </PanelCard>

          {/* PASSWORD SETTINGS */}
          <PanelCard
            title={'Change lockscreen password'}
            description={'Change the password to access the dashboard'}
            textColor={textColor}
            icon={MdVpnKey}
            mb='20px'
          >
            <SimpleCard textColor={textColor}>
              <Flex>
                <FormControl>
                  <FormLabel
                    display='flex'
                    ms='4px'
                    fontSize='sm'
                    fontWeight='500'
                    color={textColor}
                    mb='8px'
                  >
                    Password<Text color={'red'}>*</Text>
                  </FormLabel>
                  <InputGroup size='md'>
                    <InputLeftElement
                      display='flex'
                      alignItems='center'
                      mt='4px'
                    >
                      <Icon
                        color={textColor}
                        _hover={{ cursor: 'pointer' }}
                        as={MdPassword}
                      />
                    </InputLeftElement>
                    <Input
                      isRequired={true}
                      fontSize='sm'
                      placeholder='Min. 8 characters'
                      mb='24px'
                      size='lg'
                      type={'password'}
                      id='password'
                    />
                  </InputGroup>
                  <FormLabel
                    ms='4px'
                    fontSize='sm'
                    fontWeight='500'
                    color={textColor}
                    display='flex'
                  >
                    Verify Password<Text color={'red'}>*</Text>
                  </FormLabel>
                  <InputGroup size='md'>
                    <InputLeftElement
                      display='flex'
                      alignItems='center'
                      mt='4px'
                    >
                      <Icon
                        color={textColor}
                        _hover={{ cursor: 'pointer' }}
                        as={MdPassword}
                      />
                    </InputLeftElement>
                    <Input
                      isRequired={true}
                      fontSize='sm'
                      placeholder='Min. 8 characters'
                      mb='24px'
                      size='lg'
                      type={'password'}
                      id='verifypassword'
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
            </SimpleCard>
          </PanelCard>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Settings;
