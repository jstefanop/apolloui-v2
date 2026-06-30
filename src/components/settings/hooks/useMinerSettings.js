import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useIntl } from 'react-intl';
import _ from 'lodash';
import { IoLeaf, IoRocket } from 'react-icons/io5';
import { FaBalanceScale } from 'react-icons/fa';
import { RiUserSettingsFill } from 'react-icons/ri';
import { MdHdrAuto } from 'react-icons/md';

export const useMinerSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm } = useSettings();

  // Initial configurations for miner modes
  const { current: minerInitialModes } = useRef([
    {
      id: 'eco',
      icon: IoLeaf,
      color: 'brand',
      title: intl.formatMessage({ id: 'settings.sections.miner.modes.eco.title' }),
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.modes.eco.description' }),
    },
    {
      id: 'balanced',
      color: 'brand',
      icon: FaBalanceScale,
      title: intl.formatMessage({ id: 'settings.sections.miner.modes.balanced.title' }),
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.modes.balanced.description' }),
    },
    {
      id: 'turbo',
      color: 'brand',
      icon: IoRocket,
      title: intl.formatMessage({ id: 'settings.sections.miner.modes.turbo.title' }),
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.modes.turbo.description' }),
    },
    {
      id: 'custom',
      color: 'brand',
      icon: RiUserSettingsFill,
      title: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.title' }),
      alertBadge: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.warning' }),
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.warning_description' }),
      sliders: [
        {
          id: 'voltage',
          title: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.power.title' }),
          description: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.power.description' }),
          min: 30,
          max: 95,
          step: 1,
          data: {
            30: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.power.min' }),
            40: '40%',
            50: '50%',
            60: '60%',
            70: '70%',
            80: '80%',
            90: '90%',
            95: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.power.max' }),
          },
        },
        {
          id: 'frequency',
          title: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.frequency.title' }),
          description: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.frequency.description' }),
          min: 25,
          max: 60,
          step: 1,
          data: {
            25: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.frequency.min' }),
            32: '32',
            39: '39',
            46: '46',
            53: '53',
            60: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.frequency.max' }),
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
    description: intl.formatMessage({ id: 'settings.sections.miner.fan.description' }),
    sliders: [
      {
        id: 'fan_low',
        title: intl.formatMessage({ id: 'settings.sections.miner.fan.low.title' }),
        description: intl.formatMessage({ id: 'settings.sections.miner.fan.low.description' }),
        min: 40,
        max: 70,
        steps: 5,
        data: {
          40: intl.formatMessage({ id: 'settings.sections.miner.fan.low.min' }),
          50: '50°c',
          60: '60°c',
          70: intl.formatMessage({ id: 'settings.sections.miner.fan.low.max' }),
        },
      },
      {
        id: 'fan_high',
        title: intl.formatMessage({ id: 'settings.sections.miner.fan.high.title' }),
        description: intl.formatMessage({ id: 'settings.sections.miner.fan.high.description' }),
        min: 60,
        max: 90,
        steps: 5,
        data: {
          60: intl.formatMessage({ id: 'settings.sections.miner.fan.high.min' }),
          70: '70°c',
          80: '80°c',
          90: intl.formatMessage({ id: 'settings.sections.miner.fan.high.max' }),
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
    title: intl.formatMessage({ id: 'settings.sections.miner.power_led.title' }),
    selected: false,
    description: intl.formatMessage({ id: 'settings.sections.miner.power_led.description' }),
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