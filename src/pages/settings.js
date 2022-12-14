import {
  Box,
  Icon,
  Text,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Card,
  Badge,
  Divider,
  Switch,
  FormLabel,
  FormControl,
  useBoolean,
} from '@chakra-ui/react';

import React, { useState } from 'react';
import _ from 'lodash';
import {
  MdLocalFireDepartment,
  MdPower,
  MdWarning,
  MdWatchLater,
} from 'react-icons/md';
import SimpleSwitchSettingsItem from '../components/UI/SimpleSwitchSettingsItem';

const Settings = () => {
  const textColor = useColorModeValue('brands.900', 'white');

  const minerSettings = {
    mode: 'balanced',
    voltage: 30,
    frequency: 25,
    fan_low: 40,
    fan_high: 60,
  };

  let minerInitialModes = [
    {
      id: 'eco',
      icon: MdLocalFireDepartment,
      color: 'green',
      title: 'ECO Mode',
      selected: false,
      description:
        'In ECO mode your miner will be at its most efficient, but its hashrate will be slightly slower. This mode is recommended, and will produce the least amount of noise and heat.',
    },
    {
      id: 'balanced',
      color: 'blue',
      icon: MdLocalFireDepartment,
      title: 'BALANCED Mode',
      selected: false,
      description:
        'BALANCED mode is a good compromise between hashrate, efficiency, and noise.',
    },
    {
      id: 'turbo',
      color: 'orange',
      icon: MdLocalFireDepartment,
      title: 'TURBO Mode',
      selected: false,
      description:
        'In TURBO mode your miner will be the least efficient, but its hashrate will be the highest. This mode is only recommended for expert users, and you should monitor your miner for possible overheating. The fan can get loud in this mode.',
    },
    {
      id: 'custom',
      color: 'red',
      icon: MdLocalFireDepartment,
      title: 'CUSTOM Mode',
      selected: false,
      description:
        'The Apollo comes with tuned preset values (above), which offer a good range of operating modes. By selecting custom you risk damaging your device and FutureBit will not be responsible for any or all damage caused by over-clocking or over-volting',
    },
  ];

  const autoFan =
    (minerSettings.fan_low === 40 && minerSettings.fan_high === 60) || false;

  const ranges = {
    voltage: {
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
    frequency: {
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
    fan_low: {
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
    fan_high: {
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
  };

  const currentMode = _.find(minerInitialModes, { id: minerSettings.mode });
  minerInitialModes = _.map(minerInitialModes, (mode) => {
    if (mode.id === minerSettings.mode) mode.selected = true;
    return mode;
  });

  const [minerModes, setMinerModes] = useState(minerInitialModes);

  const handleSwitchMinerMode = (e) => {
    const v = (e.target.value === 'true') ? true : false;
    setMinerModes(_.map(minerModes, (mode) => {
      if (mode.id === e.target.id) mode.selected = !v;
      return mode;
    }));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid
        columns={{ base: 1, sm: 1, lg: 2, '2xl': 2 }}
        gap='20px'
        mb='20px'
      >
        {/* MINER MODES */}
        <Flex flexDirection='column'>
          <Card p='0px' bg='white'>
            <Flex
              align={{ sm: 'flex-start', lg: 'center' }}
              justify='space-between'
              w='100%'
              px='22px'
              py='18px'
            >
              <Text color={textColor} fontSize='xl' fontWeight='600'>
                Miner settings
              </Text>
              <Badge variant='solid' colorScheme={currentMode.color}>
                {currentMode.id.toUpperCase()}
              </Badge>
            </Flex>

            {minerModes.map((mode, index) => {
              return (
                <div key={mode.id}>
                  <SimpleSwitchSettingsItem
                    item={mode}
                    textColor={textColor}
                    handleSwitch={handleSwitchMinerMode}
                  />
                  {index !== minerModes.length - 1 && <Divider mb='10px' />}
                </div>
              );
            })}
          </Card>
        </Flex>
      </SimpleGrid>
    </Box>
  );
};

export default Settings;
