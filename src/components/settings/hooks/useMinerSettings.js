import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import _ from 'lodash';
import { IoLeaf, IoRocket } from 'react-icons/io5';
import { FaBalanceScale } from 'react-icons/fa';
import { RiUserSettingsFill } from 'react-icons/ri';
import { MdHdrAuto } from 'react-icons/md';

export const useMinerSettings = () => {
  const { settings, setSettings, setErrorForm } = useSettings();

  // Initial configurations for miner modes
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

  const [minerModes, setMinerModes] = useState(minerInitialModes);
  const [fanMode, setFanMode] = useState(fanInitialMode);
  const [currentMode, setCurrentMode] = useState({ id: 'loading' });
  const [minerPowerLedMode, setMinerPowerLedMode] = useState({
    id: 'powerled',
    color: 'green',
    icon: null,
    title: 'Front Status Light',
    selected: false,
    description:
      'Turn off/on the front status led. Note: your miner will be restarted to apply.',
  });

  // Initialize and update states when settings change
  useEffect(() => {
    if (!settings || settings.initial) return;

    setCurrentMode(_.find(minerInitialModes, { id: settings.minerMode }));

    setMinerModes(
      _.map(minerInitialModes, (mode) => {
        if (mode.id === settings.minerMode) mode.selected = true;
        else mode.selected = false;

        if (mode.id === 'custom') {
          mode.frequency = settings.frequency;
          mode.voltage = settings.voltage;
        }
        return mode;
      })
    );

    setFanMode((el) => {
      return {
        ...el,
        selected: settings.fan_low !== 40 || settings.fan_high !== 60,
        fan_low: settings.fan_low,
        fan_high: settings.fan_high,
      };
    });

    setMinerPowerLedMode((el) => {
      return {
        ...el,
        selected: !settings.powerLedOff,
      };
    });
  }, [settings, minerInitialModes]);

  // Handle miner mode change
  const handleSwitchMinerMode = (e) => {
    setErrorForm(null);
    setMinerModes(
      _.map(minerModes, (mode) => {
        mode.selected = mode.id === e.target.id ? true : false;
        return mode;
      })
    );
    setSettings({ ...settings, minerMode: e.target.id });
  };

  // Handle custom mode change
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

  // Handle custom mode reset
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

  // Handle fan mode change
  const handleSwitchFanMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setFanMode({ ...fanMode, selected: !v });
    if (v) {
      setSettings({ ...settings, fan_low: 40, fan_high: 60 });
      setFanMode({ ...fanMode, selected: !v, fan_low: 40, fan_high: 60 });
    }
  };

  // Handle custom fan mode change
  const handleCustomFanModeChange = (value, sliderId) => {
    setErrorForm(null);
    const fanChanges = { ...fanMode };
    fanChanges[sliderId] = value;
    setFanMode(fanChanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = value;
    setSettings(settingsChanges);
  };

  // Handle custom fan mode reset
  const handleCustomFanModeReset = (sliderId) => {
    setErrorForm(null);
    const v = sliderId === 'fan_low' ? 40 : 60;
    const fanChanges = { ...fanMode };
    fanChanges[sliderId] = v;
    setFanMode(fanChanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = v;
    setSettings(settingsChanges);
  };

  // Handle power LED change
  const handleSwitchPowerLedOff = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setMinerPowerLedMode({ ...minerPowerLedMode, selected: !v });
    setSettings({ ...settings, powerLedOff: v });
  };

  return {
    minerModes,
    fanMode,
    currentMode,
    minerPowerLedMode,
    handleSwitchMinerMode,
    handleCustomModeChange,
    handleCustomModeReset,
    handleSwitchFanMode,
    handleCustomFanModeChange,
    handleCustomFanModeReset,
    handleSwitchPowerLedOff,
  };
};