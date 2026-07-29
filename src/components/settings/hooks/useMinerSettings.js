import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useDeviceConfig } from '../../../contexts/DeviceConfigContext';
import { useIntl } from 'react-intl';
import _ from 'lodash';
import { IoLeaf, IoRocket } from 'react-icons/io5';
import { FaBalanceScale } from 'react-icons/fa';
import { RiUserSettingsFill } from 'react-icons/ri';
import { MdHdrAuto, MdSpeed } from 'react-icons/md';

// Defaults used when a slider is reset. Apollo III has no voltage or oscillator
// to reset — the board tunes those itself — and its fan defaults are the values
// the binary would use if we said nothing at all.
const LEGACY_DEFAULTS = { voltage: 30, frequency: 25, fan_low: 40, fan_high: 60 };
const APOLLO_III_DEFAULTS = { minerHashrate: 12, fanTemp: 50, fanPwm: 50 };

export const useMinerSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm } = useSettings();
  const { minerFamily, isHybrid } = useDeviceConfig();
  const isApolloIii = minerFamily === 'apollo-iii';

  // Built with useMemo, not useRef: the miner family is only known once
  // /api/config answers, so the controls have to be able to change once it does.
  const minerInitialModes = useMemo(
    () => [
      {
        id: 'super_eco',
        icon: IoLeaf,
        color: 'green',
        isIiiOnly: true,
        title: intl.formatMessage({ id: 'settings.sections.miner.modes.super_eco.title' }),
        selected: false,
        description: intl.formatMessage({ id: 'settings.sections.miner.modes.super_eco.description' }),
      },
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
        // The Apollo III warning is about heat and noise, not about exceeding a
        // power supply — the board will not let itself be over-volted.
        alertBadge: isApolloIii
          ? undefined
          : intl.formatMessage({ id: 'settings.sections.miner.modes.custom.warning' }),
        selected: false,
          description: isApolloIii
          ? intl.formatMessage({ id: 'settings.sections.miner.modes.custom.hashrate.description' })
          : intl.formatMessage({ id: 'settings.sections.miner.modes.custom.warning_description' }),
        sliders: isApolloIii
          ? [
              // One target hashrate: the board picks the voltage to reach it, so
              // there is nothing else meaningful to expose.
              {
                id: 'minerHashrate',
                unit: ' TH/s',
                title: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.hashrate.title' }),
                description: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.hashrate.slider_description' }),
                min: 5,
                max: 20,
                step: 1,
                data: {
                  5: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.hashrate.min' }),
                  10: '10',
                  14: '14',
                  18: '18',
                  20: intl.formatMessage({ id: 'settings.sections.miner.modes.custom.hashrate.max' }),
                },
              },
            ]
          : [
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
    ],
    [intl, isApolloIii]
  );

  // Apollo III runs one PID loop against a target temperature; Apollo I/II take a
  // low/high range instead.
  const fanInitialMode = useMemo(
    () => ({
      id: 'fan',
      color: 'green',
      icon: MdHdrAuto,
      title: 'AUTO',
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.fan.auto.description' }),
      sliders: isApolloIii
        ? [
            {
              id: 'fanTemp',
              unit: '°',
              title: intl.formatMessage({ id: 'settings.sections.miner.fan.target.title' }),
              description: intl.formatMessage({ id: 'settings.sections.miner.fan.target.description' }),
              // 40-80 is what apollo-miner-v3 documents, what the API validator
              // accepts and what the generator clamps to. Capping lower here made
              // a third of the supported range reachable only by hand-writing a
              // mutation.
              min: 40,
              max: 80,
              step: 1,
              data: {
                40: intl.formatMessage({ id: 'settings.sections.miner.fan.target.min' }),
                55: '55°c',
                70: '70°c',
                80: intl.formatMessage({ id: 'settings.sections.miner.fan.target.max' }),
              },
            },
          ]
        : [
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
    }),
    [intl, isApolloIii]
  );

  // Apollo III only: a fixed duty cycle that replaces the PID loop entirely.
  const fanOverrideInitialMode = useMemo(
    () => ({
      id: 'fanOverride',
      color: 'orange',
      icon: MdSpeed,
      title: intl.formatMessage({ id: 'settings.sections.miner.fan.override.title' }),
      selected: false,
      description: intl.formatMessage({ id: 'settings.sections.miner.fan.override.description' }),
      sliders: [
        {
          id: 'fanPwm',
          unit: '%',
          title: intl.formatMessage({ id: 'settings.sections.miner.fan.override.speed.title' }),
          description: intl.formatMessage({ id: 'settings.sections.miner.fan.override.speed.description' }),
          min: 10,
          max: 100,
          step: 5,
          data: {
            10: intl.formatMessage({ id: 'settings.sections.miner.fan.override.speed.min' }),
            40: '40%',
            70: '70%',
            100: intl.formatMessage({ id: 'settings.sections.miner.fan.override.speed.max' }),
          },
        },
      ],
    }),
    [intl]
  );

  const [minerModes, setMinerModes] = useState(() =>
    minerInitialModes.filter((mode) => !mode.isIiiOnly || isApolloIii)
  );
  const [fanMode, setFanMode] = useState(fanInitialMode);
  const [fanOverrideMode, setFanOverrideMode] = useState(fanOverrideInitialMode);
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

    setCurrentMode(
      _.find(minerInitialModes, { id: settings.minerMode }) || { id: settings.minerMode || 'eco' }
    );

    setMinerModes(
      _.chain(minerInitialModes)
        // Apollo III-only presets are hidden on devices without an internal III.
        .filter((mode) => !mode.isIiiOnly || isApolloIii)
        .map((mode) => {
          mode.selected = mode.id === settings.minerMode;

          if (mode.id === 'custom') {
            if (isApolloIii) {
              mode.minerHashrate = settings.minerHashrate;
            } else {
              mode.frequency = settings.frequency;
              mode.voltage = settings.voltage;
            }
          }
          // "Apollo III only" badge shown only in hybrid (mixed III + USB).
          if (mode.isIiiOnly) {
            mode.alertBadge = isHybrid
              ? intl.formatMessage({ id: 'settings.sections.miner.modes.apollo_iii_only' })
              : undefined;
          }
          return mode;
        })
        .value()
    );

    setFanMode((el) => ({
      ...el,
      sliders: fanInitialMode.sliders,
      // "Selected" here means "not on the binary's own defaults", which is what
      // opens the sliders.
      selected: isApolloIii
        ? settings.fanTemp != null
        : settings.fan_low !== 40 || settings.fan_high !== 60,
      fanTemp: settings.fanTemp ?? APOLLO_III_DEFAULTS.fanTemp,
      fan_low: settings.fan_low,
      fan_high: settings.fan_high,
    }));

    setFanOverrideMode((el) => ({
      ...el,
      selected: settings.fanPwm != null,
      fanPwm: settings.fanPwm ?? APOLLO_III_DEFAULTS.fanPwm,
    }));

    setMinerPowerLedMode((el) => {
      return {
        ...el,
        selected: !settings.powerLedOff,
      };
    });
  }, [settings, minerInitialModes, fanInitialMode, isApolloIii, isHybrid, intl]);

  // Handle miner mode change
  const handleSwitchMinerMode = (e) => {
    setErrorForm(null);
    setMinerModes(
      _.map(minerModes, (mode) => {
        mode.selected = mode.id === e.target.id ? true : false;
        return mode;
      })
    );

    const changes = { ...settings, minerMode: e.target.id };
    // Entering custom mode on an Apollo III needs a hashrate to act on, otherwise
    // the generator falls back to eco and the choice appears to do nothing.
    if (isApolloIii && e.target.id === 'custom' && changes.minerHashrate == null) {
      changes.minerHashrate = APOLLO_III_DEFAULTS.minerHashrate;
    }
    setSettings(changes);
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
    const v = { ...LEGACY_DEFAULTS, ...APOLLO_III_DEFAULTS }[sliderId];
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
    const isAuto = e.target.value === 'true' ? true : false;

    if (isApolloIii) {
      // Back to automatic: drop the target so the binary uses its own default,
      // rather than leaving a stale number behind on the command line.
      const fanTemp = isAuto ? null : APOLLO_III_DEFAULTS.fanTemp;
      setFanMode({ ...fanMode, selected: !isAuto, fanTemp: fanTemp ?? APOLLO_III_DEFAULTS.fanTemp });
      setSettings({ ...settings, fanTemp });
      return;
    }

    setFanMode({ ...fanMode, selected: !isAuto });
    if (isAuto) {
      setSettings({ ...settings, fan_low: 40, fan_high: 60 });
      setFanMode({ ...fanMode, selected: !isAuto, fan_low: 40, fan_high: 60 });
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
    const v = { ...LEGACY_DEFAULTS, ...APOLLO_III_DEFAULTS }[sliderId];
    const fanChanges = { ...fanMode };
    fanChanges[sliderId] = v;
    setFanMode(fanChanges);

    const settingsChanges = { ...settings };
    settingsChanges[sliderId] = v;
    setSettings(settingsChanges);
  };

  // Apollo III only: a fixed fan speed replaces automatic control, so turning it
  // off has to clear the value — otherwise the miner would keep running at a
  // fixed duty cycle the UI no longer shows.
  const handleSwitchFanOverride = (e) => {
    setErrorForm(null);
    const enabled = e.target.value === 'true' ? false : true;
    const fanPwm = enabled ? fanOverrideMode.fanPwm ?? APOLLO_III_DEFAULTS.fanPwm : null;
    setFanOverrideMode({
      ...fanOverrideMode,
      selected: enabled,
      fanPwm: fanPwm ?? APOLLO_III_DEFAULTS.fanPwm,
    });
    setSettings({ ...settings, fanPwm });
  };

  const handleFanOverrideChange = (value, sliderId) => {
    setErrorForm(null);
    setFanOverrideMode({ ...fanOverrideMode, [sliderId]: value });
    setSettings({ ...settings, [sliderId]: value });
  };

  const handleFanOverrideReset = (sliderId) => {
    setErrorForm(null);
    const v = APOLLO_III_DEFAULTS[sliderId];
    setFanOverrideMode({ ...fanOverrideMode, [sliderId]: v });
    setSettings({ ...settings, [sliderId]: v });
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
    fanOverrideMode,
    currentMode,
    minerPowerLedMode,
    isApolloIii,
    handleSwitchMinerMode,
    handleCustomModeChange,
    handleCustomModeReset,
    handleSwitchFanMode,
    handleCustomFanModeChange,
    handleCustomFanModeReset,
    handleSwitchFanOverride,
    handleFanOverrideChange,
    handleFanOverrideReset,
    handleSwitchPowerLedOff,
  };
};
