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
import RuleTemplatesModal from './RuleTemplatesModal';

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

  it('shows the paused banner from the live state alone (no config refetch)', () => {
    const inAnHour = new Date(Date.now() + 3600 * 1000).toISOString();
    renderUI(
      <AutomationStatusCard
        config={{ enabled: true, dryRun: false }} // no overrideUntil in config
        state={{ ...state, miner: { running: true, mode: 'balanced', overrideUntil: inAnHour } }}
        onToggleEnabled={() => {}}
        onToggleDryRun={() => {}}
        onClearOverride={() => {}}
      />
    );
    expect(screen.getByText(/Automation paused until/)).toBeInTheDocument();
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
  it('reads a rule back as coloured chips, not JSON', () => {
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

    // Condition and action read as human text, each in its own chip — and the
    // operator is spelled out so it can't be misread as "=".
    expect(screen.getByText('Board temperature (hottest) greater than 80 °C')).toBeInTheDocument();
    expect(screen.getByText('stop the miner')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
    expect(screen.getByText('In charge')).toBeInTheDocument();
  });

  it('shows weekdays as names and booleans as Yes/No, not raw values', () => {
    const wkDescriptors = [
      { id: 'clock.weekday', type: 'number', widget: 'weekday', ops: ['in', 'not_in'], supportsHysteresis: false },
      { id: 'sun.isDay', type: 'boolean', widget: 'boolean', ops: ['==', '!='], supportsHysteresis: false },
    ];
    const rule = {
      id: 2,
      name: 'Weekend day',
      enabled: true,
      priority: 100,
      isSafety: false,
      match: 'all',
      conditions: [
        { signal: 'clock.weekday', op: 'in', values: ['6', '7'] },
        { signal: 'sun.isDay', op: '==', value: 'true' },
      ],
      action: { type: 'mode', mode: 'turbo' },
    };

    renderUI(
      <RulesList
        rules={[rule]}
        descriptors={wkDescriptors}
        onCreate={() => {}}
        onEdit={() => {}}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('Day of week: Sat, Sun')).toBeInTheDocument();
    expect(screen.getByText('Daylight: Yes')).toBeInTheDocument();
    expect(screen.getByText('run in turbo')).toBeInTheDocument();
  });

  it('shows temperatures in the user unit (Fahrenheit)', () => {
    renderUI(
      <RulesList
        rules={[thermalRule]}
        descriptors={descriptors}
        temperatureUnit="f"
        onCreate={() => {}}
        onEdit={() => {}}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    );
    // 80 °C → 176 °F in the chip.
    expect(screen.getByText('Board temperature (hottest) greater than 176 °F')).toBeInTheDocument();
  });

  it('gives each rule a drag handle so precedence is reorderable', () => {
    renderUI(
      <RulesList
        rules={[thermalRule, { ...thermalRule, id: 9, name: 'Second' }]}
        descriptors={descriptors}
        onCreate={() => {}}
        onEdit={() => {}}
        onToggle={() => {}}
        onDelete={() => {}}
        onReorder={() => {}}
      />
    );
    expect(screen.getAllByLabelText('Drag to reorder')).toHaveLength(2);
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

  it('blocks a "turn on" rule that hinges on a running-only signal', () => {
    const runningOnlyDescriptors = [
      { id: 'miner.temperature', type: 'number', unit: '°C', ops: ['<', '>'], supportsHysteresis: true, availableWhileOff: false },
    ];
    const resumeRule = {
      id: 5,
      name: 'Resume when cool',
      enabled: true,
      priority: 0,
      isSafety: false,
      match: 'all',
      conditions: [{ signal: 'miner.temperature', op: '<', value: '60' }],
      action: { type: 'mode', mode: 'turbo' },
    };

    renderUI(
      <RuleEditorModal isOpen onClose={() => {}} onSave={() => {}} rule={resumeRule} descriptors={runningOnlyDescriptors} />
    );

    expect(screen.getByText(/can only be read while the miner runs/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save rule' })).toBeDisabled();
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

describe('RuleTemplatesModal', () => {
  it('lists templates, flagging composite and location-only ones', () => {
    renderUI(<RuleTemplatesModal isOpen onClose={() => {}} onPick={() => {}} locationSet={false} />);

    expect(screen.getByText('Thermal protection')).toBeInTheDocument();
    expect(screen.getByText('Workday pause')).toBeInTheDocument();
    // At least the two composite templates carry the multi-condition badge.
    expect(screen.getAllByText('Multi-condition').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Needs location').length).toBeGreaterThanOrEqual(2);
  });

  it('picks a template as a new rule (no id) with a localized name', async () => {
    const onPick = jest.fn();
    renderUI(<RuleTemplatesModal isOpen onClose={() => {}} onPick={onPick} locationSet />);

    await userEvent.click(screen.getByText('Thermal protection'));

    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Thermal protection', isSafety: true, action: { type: 'off', mode: null } })
    );
    expect(onPick.mock.calls[0][0].id).toBeUndefined(); // a new rule, not an edit
  });
});

describe('EventsTimeline', () => {
  const event = {
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
  };

  it('shows the values behind a decision, not just the verdict', () => {
    renderUI(<EventsTimeline events={[event]} />);

    expect(screen.getByText('stop applied (safety)')).toBeInTheDocument();
    // The evidence is shown; the unreadable signal is not dressed up as a value.
    expect(screen.getByText('miner.temperature=88')).toBeInTheDocument();
    expect(screen.queryByText(/energy.price/)).not.toBeInTheDocument();
  });

  it('opens a detail modal with the full record when an event is clicked', async () => {
    renderUI(<EventsTimeline events={[event]} />);

    await userEvent.click(screen.getByText('stop applied (safety)'));

    expect(screen.getByText('Event detail')).toBeInTheDocument();
    // The detail shows every signal, including the stale one the row omitted.
    expect(screen.getByText('energy.price')).toBeInTheDocument();
    expect(screen.getByText('no data')).toBeInTheDocument();
  });

  it('offers Load more only when there is deeper history', () => {
    const onLoadMore = jest.fn();
    const { rerender } = renderUI(<EventsTimeline events={[event]} hasMore={false} onLoadMore={onLoadMore} />);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <IntlProvider locale="en" messages={flattenMessages(en)}>
          <EventsTimeline events={[event]} hasMore onLoadMore={onLoadMore} />
        </IntlProvider>
      </ChakraProvider>
    );
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });
});
