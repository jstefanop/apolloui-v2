import {
  MdBedtime,
  MdThermostat,
  MdWbSunny,
  MdWork,
  MdWbTwilight,
} from 'react-icons/md';

/**
 * Starter rules the user can open, tweak and save. They are only *drafts*: picking
 * one opens the normal rule editor, so it still goes through validation and the
 * user sets the final thresholds.
 *
 * Rules by construction never turn the miner on via a running-only signal (board
 * temperature) — board temperature is used only to stop. Names and descriptions
 * are localized via `automation.templates.<id>.{name,desc}`.
 *
 * Temperatures are in canonical °C (like stored rules); the editor shows them in
 * the user's unit. `requiresLocation` templates rely on sun/weather, which need
 * the coordinates set in Settings → System.
 */
export const RULE_TEMPLATES = [
  {
    id: 'thermal_protection',
    icon: MdThermostat,
    requiresLocation: false,
    rule: {
      enabled: true,
      isSafety: true,
      match: 'all',
      conditions: [{ signal: 'miner.temperature', op: '>', value: '75', values: [], hysteresis: 3 }],
      action: { type: 'off', mode: null },
    },
  },
  {
    id: 'quiet_hours',
    icon: MdBedtime,
    requiresLocation: false,
    rule: {
      enabled: true,
      isSafety: false,
      match: 'all',
      conditions: [{ signal: 'clock.time', op: 'between', value: null, values: ['23:00', '07:00'], hysteresis: null }],
      action: { type: 'off', mode: null },
    },
  },
  {
    // Composite (zero-config): weekdays AND working hours.
    id: 'workday_pause',
    icon: MdWork,
    requiresLocation: false,
    rule: {
      enabled: true,
      isSafety: false,
      match: 'all',
      conditions: [
        { signal: 'clock.weekday', op: 'in', value: null, values: ['1', '2', '3', '4', '5'], hysteresis: null },
        { signal: 'clock.time', op: 'between', value: null, values: ['09:00', '18:00'], hysteresis: null },
      ],
      action: { type: 'off', mode: null },
    },
  },
  {
    id: 'daytime_turbo',
    icon: MdWbSunny,
    requiresLocation: true,
    rule: {
      enabled: true,
      isSafety: false,
      match: 'all',
      conditions: [{ signal: 'sun.isDay', op: '==', value: 'true', values: [], hysteresis: null }],
      action: { type: 'mode', mode: 'turbo' },
    },
  },
  {
    // Composite (needs location): daylight AND not too hot outside → turbo.
    id: 'sunny_mild_turbo',
    icon: MdWbTwilight,
    requiresLocation: true,
    rule: {
      enabled: true,
      isSafety: false,
      match: 'all',
      conditions: [
        { signal: 'sun.isDay', op: '==', value: 'true', values: [], hysteresis: null },
        { signal: 'weather.temperature', op: '<', value: '28', values: [], hysteresis: 2 },
      ],
      action: { type: 'mode', mode: 'turbo' },
    },
  },
];
