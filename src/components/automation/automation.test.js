import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../locales/en.json';
import { flattenMessages } from '../../lib/utils';

import AutomationStatusCard from './AutomationStatusCard';
import RulesList from './RulesList';
import RuleEditorModal from './RuleEditorModal';
import EventsTimeline from './EventsTimeline';

// These components are only ever exercised at render time — a build passes
// happily over a component that throws the moment it mounts. (That is exactly
// how the hasInternalMiner crash shipped.)
const renderUI = (ui) =>
  render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={flattenMessages(en)}>
        {ui}
      </IntlProvider>
    </ChakraProvider>
  );

const descriptors = [
  { id: 'miner.temperature', type: 'number', unit: '°C', ops: ['<', '>'], supportsHysteresis: true },
  { id: 'clock.time', type: 'time', ops: ['between'], supportsHysteresis: false },
];

const thermalRule = {
  id: 1,
  name: 'Thermal protection',
  enabled: true,
  priority: 0,
  isSafety: true,
  match: 'all',
  conditions: [{ signal: 'miner.temperature', op: '>', value: '80', hysteresis: 5 }],
  action: { type: 'off', mode: null },
};

describe('AutomationStatusCard', () => {
  const state = {
    decision: { target: 'off', ruleId: 1, ruleName: 'Thermal protection', reason: 'safety' },
    guard: { apply: true, changeType: 'stop', blockedBy: null, message: null },
    miner: { running: true, mode: 'balanced' },
    signals: [],
  };

  it('shows what the engine decided and which rule decided it', () => {
    renderUI(
      <AutomationStatusCard
        config={{ enabled: true, dryRun: false }}
        state={state}
        onToggleEnabled={() => {}}
        onToggleDryRun={() => {}}
        onClearOverride={() => {}}
      />
    );

    expect(screen.getByText('Stop the miner')).toBeInTheDocument();
    expect(screen.getByText('Thermal protection')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('says a rule is being throttled, rather than looking broken', () => {
    renderUI(
      <AutomationStatusCard
        config={{ enabled: true, dryRun: false }}
        state={{
          ...state,
          guard: { apply: false, changeType: 'stop', blockedBy: 'min_on', message: 'running for 4m, minimum on-time is 30m' },
        }}
        onToggleEnabled={() => {}}
        onToggleDryRun={() => {}}
        onClearOverride={() => {}}
      />
    );

    expect(screen.getByText('min_on')).toBeInTheDocument();
    expect(screen.getByText(/minimum on-time is 30m/)).toBeInTheDocument();
  });

  it('offers a way back when a manual action paused the automation', async () => {
    const onClearOverride = jest.fn();
    const inAnHour = new Date(Date.now() + 3600 * 1000).toISOString();

    renderUI(
      <AutomationStatusCard
        config={{ enabled: true, dryRun: false, overrideUntil: inAnHour }}
        state={state}
        onToggleEnabled={() => {}}
        onToggleDryRun={() => {}}
        onClearOverride={onClearOverride}
      />
    );

    expect(screen.getByText(/Automation paused until/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Resume now' }));
    expect(onClearOverride).toHaveBeenCalled();
  });

  it('warns while in observation mode', () => {
    renderUI(
      <AutomationStatusCard
        config={{ enabled: true, dryRun: true }}
        state={state}
        onToggleEnabled={() => {}}
        onToggleDryRun={() => {}}
        onClearOverride={() => {}}
      />
    );

    expect(screen.getByText(/decisions are recorded but the miner is not touched/i)).toBeInTheDocument();
  });
});

describe('RulesList', () => {
  it('reads a rule back as a sentence, not as JSON', () => {
    renderUI(
      <RulesList
        rules={[thermalRule]}
        descriptors={descriptors}
        activeRuleId={1}
        onCreate={() => {}}
        onEdit={() => {}}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    );

    expect(
      screen.getByText(/Board temperature \(hottest\) > 80 °C → stop the miner/)
    ).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
    expect(screen.getByText('In charge')).toBeInTheDocument();
  });

  it('invites the first rule when there are none', () => {
    renderUI(
      <RulesList
        rules={[]}
        descriptors={descriptors}
        onCreate={() => {}}
        onEdit={() => {}}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText(/No rules yet/)).toBeInTheDocument();
  });
});

describe('RuleEditorModal', () => {
  it('builds the signal list from the backend descriptors', () => {
    renderUI(
      <RuleEditorModal
        isOpen
        onClose={() => {}}
        onSave={() => {}}
        rule={thermalRule}
        descriptors={descriptors}
      />
    );

    // Not a hardcoded list: whatever the backend declares shows up here.
    expect(screen.getByRole('option', { name: 'Board temperature (hottest)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Time of day' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Thermal protection')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('sends condition values as strings, the way the engine expects them', async () => {
    const onSave = jest.fn();

    renderUI(
      <RuleEditorModal
        isOpen
        onClose={() => {}}
        onSave={onSave}
        rule={thermalRule}
        descriptors={descriptors}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save rule' }));

    expect(onSave).toHaveBeenCalledWith({
      id: 1,
      input: expect.objectContaining({
        name: 'Thermal protection',
        isSafety: true,
        conditions: [
          { signal: 'miner.temperature', op: '>', value: '80', values: null, hysteresis: 5 },
        ],
        action: { type: 'off' },
      }),
    });
  });
});

describe('EventsTimeline', () => {
  it('shows the values behind a decision, not just the verdict', () => {
    renderUI(
      <EventsTimeline
        events={[
          {
            id: 1,
            ruleName: 'Thermal protection',
            decision: 'off',
            changeType: 'stop',
            applied: true,
            dryRun: false,
            blockedBy: null,
            message: 'stop applied (safety)',
            createdAt: new Date().toISOString(),
            signals: [
              { id: 'miner.temperature', value: '88', stale: false },
              { id: 'energy.price', value: null, stale: true },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText('stop applied (safety)')).toBeInTheDocument();
    // The evidence is shown; the unreadable signal is not dressed up as a value.
    expect(screen.getByText('miner.temperature=88')).toBeInTheDocument();
    expect(screen.queryByText(/energy.price/)).not.toBeInTheDocument();
  });
});
