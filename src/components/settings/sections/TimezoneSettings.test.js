import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../../locales/en.json';
import { flattenMessages } from '../../../lib/utils';
import { SettingsProvider } from '../context/SettingsContext';
import { MCU_TIMEZONE_QUERY } from '../../../graphql/mcu';
import TimezoneSettings from './TimezoneSettings';

// A settings section is only ever exercised at render time; a build passes right
// over one that throws on mount. Mount it, and check it drives the shared
// settings state instead of a private save button.
const timezoneMock = {
  request: { query: MCU_TIMEZONE_QUERY },
  result: {
    data: {
      Mcu: {
        timezone: {
          result: { timezone: 'America/New_York', available: ['America/New_York', 'Europe/Rome', 'UTC'] },
          error: null,
        },
      },
    },
  },
};

const renderUI = (settings, setSettings) =>
  render(
    <MockedProvider mocks={[timezoneMock]} addTypename={false}>
      <ChakraProvider>
        <IntlProvider locale="en" messages={flattenMessages(en)}>
          <SettingsProvider value={{ settings, setSettings }}>
            <TimezoneSettings />
          </SettingsProvider>
        </IntlProvider>
      </ChakraProvider>
    </MockedProvider>
  );

describe('TimezoneSettings', () => {
  it('mounts and lists the zones the device reported', async () => {
    renderUI({ timezone: 'America/New_York' }, () => {});

    expect(await screen.findByRole('option', { name: 'Europe/Rome' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('America/New_York');
  });

  it('writes the choice into the shared settings, not a private save', async () => {
    const setSettings = jest.fn();
    renderUI({ timezone: 'America/New_York' }, setSettings);

    await screen.findByRole('option', { name: 'Europe/Rome' });
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Europe/Rome');

    // No own Save button — the global save/discard bar handles it.
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ timezone: 'Europe/Rome' }));
  });
});
