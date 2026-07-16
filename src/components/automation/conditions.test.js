import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../locales/en.json';
import { flattenMessages } from '../../lib/utils';
import CurrentConditionsCard from './CurrentConditionsCard';

const renderUI = (ui) =>
  render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={flattenMessages(en)}>
        {ui}
      </IntlProvider>
    </ChakraProvider>
  );

const descriptors = [
  { id: 'clock.time', type: 'time', unit: undefined },
  { id: 'clock.weekday', type: 'number' },
  { id: 'sun.isDay', type: 'boolean' },
  { id: 'sun.minutesToSunset', type: 'number', unit: 'min' },
  { id: 'miner.temperature', type: 'number', unit: '°C' },
  { id: 'weather.cloudCover', type: 'number', unit: '%' },
  { id: 'energy.price', type: 'number' },
  { id: 'input.surplus', type: 'number', unit: 'W' },
];

const signals = [
  { id: 'clock.time', value: '14:32', stale: false },
  { id: 'clock.weekday', value: '3', stale: false },
  { id: 'sun.isDay', value: 'true', stale: false },
  { id: 'sun.minutesToSunset', value: '134', stale: false },
  { id: 'miner.temperature', value: '80', stale: false },
  { id: 'weather.cloudCover', value: '40', stale: false },
  { id: 'energy.price', value: '0.21', stale: false },
  { id: 'input.surplus', value: '850', stale: false },
  { id: 'sun.minutesToSunrise', value: null, stale: true },
];

describe('CurrentConditionsCard', () => {
  it('renders each signal in human-readable form', () => {
    renderUI(<CurrentConditionsCard signals={signals} descriptors={descriptors} currency="EUR" />);

    expect(screen.getByText('14:32')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument(); // weekday 3 → name
    expect(screen.getByText('Yes')).toBeInTheDocument(); // daylight
    expect(screen.getByText('2h 14m')).toBeInTheDocument(); // 134 min
    expect(screen.getByText('80 °C')).toBeInTheDocument();
    expect(screen.getByText('40 %')).toBeInTheDocument();
    expect(screen.getByText('0.21 EUR/kWh')).toBeInTheDocument();
    expect(screen.getByText('850 W')).toBeInTheDocument();
    expect(screen.getByText('MQTT: surplus')).toBeInTheDocument();
  });

  it('shows a dash for a stale signal', () => {
    renderUI(<CurrentConditionsCard signals={signals} descriptors={descriptors} />);
    // minutesToSunrise is stale (not pending) → dash.
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a spinner, not a dash, while a value is still being fetched', () => {
    const withPending = [
      { id: 'weather.temperature', value: null, stale: true, pending: true },
      { id: 'miner.temperature', value: null, stale: true, pending: false },
    ];
    renderUI(<CurrentConditionsCard signals={withPending} descriptors={descriptors} />);
    // Pending weather → "loading…" text; unavailable miner temp → dash.
    expect(screen.getByText('loading…')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('converts temperature to the user unit', () => {
    renderUI(<CurrentConditionsCard signals={signals} descriptors={descriptors} temperatureUnit="f" />);
    expect(screen.getByText('176 °F')).toBeInTheDocument(); // 80 °C
  });

  it('nudges to set the location when it is missing, and not when it is set', () => {
    const { rerender } = renderUI(
      <CurrentConditionsCard signals={signals} descriptors={descriptors} locationSet={false} />
    );
    expect(screen.getByText(/need your location/)).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <IntlProvider locale="en" messages={flattenMessages(en)}>
          <CurrentConditionsCard signals={signals} descriptors={descriptors} locationSet />
        </IntlProvider>
      </ChakraProvider>
    );
    expect(screen.queryByText(/need your location/)).not.toBeInTheDocument();
  });
});
