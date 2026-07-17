import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../locales/en.json';
import { flattenMessages } from '../../lib/utils';
import TariffCard from './TariffCard';
import GuardRailsCard from './GuardRailsCard';

const renderUI = (ui) =>
  render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={flattenMessages(en)}>
        {ui}
      </IntlProvider>
    </ChakraProvider>
  );

const tariffConfig = {
  tariff: {
    currency: 'EUR',
    flatPrice: 0.25,
    periods: [{ days: [1, 2, 3], from: '23:00', to: '07:00', price: 0.12, band: 'night' }],
  },
};

describe('TariffCard', () => {
  it('mounts, with a currency dropdown (not free text) and weekday toggles', () => {
    renderUI(<TariffCard config={tariffConfig} currentPrice={0.12} onSave={() => {}} />);

    // Currency is a select with known options, not an arbitrary text field.
    expect(screen.getByRole('option', { name: '€ EUR' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '$ USD' })).toBeInTheDocument();

    // Weekdays render as buttons.
    expect(screen.getByRole('button', { name: 'Mon' })).toBeInTheDocument();
  });

  it('falls back to EUR when the saved currency is not a known code', () => {
    // Leftover from the old free-text field: an invalid currency must not leak
    // into the "now" badge as gibberish.
    renderUI(
      <TariffCard
        config={{ tariff: { currency: 'qwwqw', flatPrice: 0.21, periods: [] } }}
        currentPrice={0.21}
        onSave={() => {}}
      />
    );
    expect(screen.getByText(/EUR\/kWh/)).toBeInTheDocument();
    expect(screen.queryByText(/qwwqw/i)).not.toBeInTheDocument();
  });

  it('uses numeric price inputs, so letters cannot be typed', () => {
    renderUI(<TariffCard config={tariffConfig} currentPrice={null} onSave={() => {}} />);
    const numberInputs = document.querySelectorAll('input[type="number"]');
    // flat price + band price.
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('blocks saving a band with no day, and says why', async () => {
    const onSave = jest.fn();
    renderUI(<TariffCard config={tariffConfig} currentPrice={null} onSave={onSave} />);

    // Deselect the three active days.
    for (const day of ['Mon', 'Tue', 'Wed']) {
      await userEvent.click(screen.getByRole('button', { name: day }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText(/at least one day/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('blocks saving a band with no price, and says why', async () => {
    const onSave = jest.fn();
    renderUI(
      <TariffCard
        config={{ tariff: { currency: 'EUR', flatPrice: 0.25, periods: [{ days: [1], from: '23:00', to: '07:00', price: '', band: 'night' }] } }}
        currentPrice={null}
        onSave={onSave}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // An empty price would be Number('') === 0 — a silent free-energy band.
    expect(screen.getByText(/needs a price/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('the All button re-selects every day, and then it saves', async () => {
    const onSave = jest.fn();
    renderUI(<TariffCard config={tariffConfig} currentPrice={null} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const arg = onSave.mock.calls[0][0];
    expect(arg.tariff.periods[0].days).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('GuardRailsCard', () => {
  const config = {
    minOnMinutes: 30,
    minOffMinutes: 30,
    minChangeMinutes: 15,
    maxCyclesPerHour: 2,
    defaultHysteresis: 2,
    overrideMinutes: 60,
    fallbackAction: 'keep',
  };

  it('mounts with numeric fields and saves numbers', async () => {
    const onSave = jest.fn();
    renderUI(<GuardRailsCard config={config} onSave={onSave} />);

    expect(screen.getByText('Max starts (/h)')).toBeInTheDocument();
    // Every guard-rail value is a number input.
    expect(document.querySelectorAll('input[type="number"]').length).toBe(6);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ minOnMinutes: 30, maxCyclesPerHour: 2 }));
  });

  it('skips an emptied field instead of saving it as 0', async () => {
    const onSave = jest.fn();
    renderUI(<GuardRailsCard config={config} onSave={onSave} />);

    // Clearing "Min on" must not disable the guard rail: Number('') is 0, so the
    // key is omitted (the backend patches, leaving the stored value untouched).
    const inputs = document.querySelectorAll('input[type="number"]');
    await userEvent.clear(inputs[0]); // minOnMinutes

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const arg = onSave.mock.calls[0][0];
    expect(arg).not.toHaveProperty('minOnMinutes');
    expect(arg.minOffMinutes).toBe(30); // the rest is still sent
  });
});
