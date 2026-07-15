import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../locales/en.json';
import { flattenMessages } from '../../lib/utils';
import RuleEditorModal from './RuleEditorModal';

const renderUI = (ui) =>
  render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={flattenMessages(en)}>
        {ui}
      </IntlProvider>
    </ChakraProvider>
  );

const descriptors = [
  { id: 'clock.weekday', type: 'number', widget: 'weekday', options: ['1', '2', '3', '4', '5', '6', '7'], ops: ['in', 'not_in'], supportsHysteresis: false },
  { id: 'sun.isDay', type: 'boolean', widget: 'boolean', ops: ['==', '!='], supportsHysteresis: false },
  { id: 'clock.date', type: 'string', widget: 'date', ops: ['==', 'between'], supportsHysteresis: false },
  { id: 'miner.mode', type: 'string', widget: 'enum', options: ['eco', 'balanced', 'turbo', 'custom'], ops: ['==', '!='], supportsHysteresis: false },
  { id: 'miner.temperature', type: 'number', widget: 'number', unit: '°C', ops: ['<', '>'], supportsHysteresis: true },
  { id: 'energy.band', type: 'string', widget: 'band', ops: ['==', '!='], supportsHysteresis: false },
  { id: 'input.surplus', type: 'number', widget: 'number', unit: 'W', ops: ['<', '>'], supportsHysteresis: true },
];

const ruleWith = (condition) => ({
  id: 1,
  name: 'R',
  enabled: true,
  priority: 100,
  isSafety: false,
  match: 'all',
  conditions: [condition],
  action: { type: 'mode', mode: 'turbo' },
});

const open = (rule, extra = descriptors, bands = []) =>
  renderUI(
    <RuleEditorModal isOpen onClose={() => {}} onSave={() => {}} rule={rule} descriptors={extra} bands={bands} />
  );

describe('RuleEditorModal — per-widget condition inputs', () => {
  it('day-of-week renders weekday toggles, not a free-text field', () => {
    open(ruleWith({ signal: 'clock.weekday', op: 'in', values: ['6', '7'] }));

    expect(screen.getByRole('button', { name: 'Sat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sun' })).toBeInTheDocument();
    // The hint explains the condition in words.
    expect(screen.getByText(/day of the week/i)).toBeInTheDocument();
  });

  it('a boolean signal renders a Yes/No choice', () => {
    open(ruleWith({ signal: 'sun.isDay', op: '==', value: 'true' }));
    expect(screen.getByRole('option', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'No' })).toBeInTheDocument();
  });

  it('a date signal renders a date picker', () => {
    open(ruleWith({ signal: 'clock.date', op: '==', value: '2026-07-15' }));
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('a number signal renders a numeric input', () => {
    open(ruleWith({ signal: 'miner.temperature', op: '>', value: '80', hysteresis: 5 }));
    expect(document.querySelector('input[type="number"]')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('shows a temperature in the user unit and stores it back in °C', async () => {
    const onSave = jest.fn();
    renderUI(
      <RuleEditorModal
        isOpen
        onClose={() => {}}
        onSave={onSave}
        rule={ruleWith({ signal: 'miner.temperature', op: '>', value: '80', hysteresis: 5 })}
        descriptors={descriptors}
        temperatureUnit="f"
      />
    );

    // 80 °C is shown as 176 °F, the hysteresis (a delta) as 9 °F.
    expect(screen.getByDisplayValue('176')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save rule' }));
    const cond = onSave.mock.calls[0][0].input.conditions[0];
    expect(cond.value).toBe('80'); // converted back to canonical °C
    expect(cond.hysteresis).toBe(5);
  });

  it('tariff band renders a select of the defined bands, not free text', () => {
    open(ruleWith({ signal: 'energy.band', op: '==', value: 'night' }), descriptors, ['night', 'peak']);
    expect(screen.getByRole('option', { name: 'night' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'peak' })).toBeInTheDocument();
  });

  it('labels an MQTT input signal as "MQTT: <name>", not "input.<name>"', () => {
    open(ruleWith({ signal: 'input.surplus', op: '>', value: '800' }));
    expect(screen.getByRole('option', { name: 'MQTT: surplus' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'input.surplus' })).not.toBeInTheDocument();
    // Generic hint for MQTT inputs.
    expect(screen.getByText(/read from an MQTT topic/i)).toBeInTheDocument();
  });

  it('does not offer the tariff-band condition when no bands exist', () => {
    // A rule on another signal, no bands defined: energy.band must not be selectable.
    open(ruleWith({ signal: 'miner.temperature', op: '>', value: '80' }), descriptors, []);
    expect(screen.queryByRole('option', { name: 'Price band' })).not.toBeInTheDocument();
  });
});

describe('RuleEditorModal — miner modes from the backend descriptor', () => {
  it('lists exactly the modes the descriptor declares', () => {
    open(ruleWith({ signal: 'sun.isDay', op: '==', value: 'true' }));
    for (const mode of ['eco', 'balanced', 'turbo', 'custom']) {
      expect(screen.getByRole('option', { name: mode })).toBeInTheDocument();
    }
  });

  it('picks up a new mode (e.g. Apollo III) without any UI change', () => {
    const withExtraMode = descriptors.map((d) =>
      d.id === 'miner.mode' ? { ...d, options: [...d.options, 'super-eco'] } : d
    );
    renderUI(
      <RuleEditorModal
        isOpen
        onClose={() => {}}
        onSave={() => {}}
        rule={ruleWith({ signal: 'sun.isDay', op: '==', value: 'true' })}
        descriptors={withExtraMode}
      />
    );
    expect(screen.getByRole('option', { name: 'super-eco' })).toBeInTheDocument();
  });
});
