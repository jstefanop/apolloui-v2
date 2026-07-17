import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';

import en from '../../../locales/en.json';
import { flattenMessages } from '../../../lib/utils';
import { SettingsProvider } from '../context/SettingsContext';
import LocationSettings from './LocationSettings';

const renderUI = (settings, setSettings) =>
  render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={flattenMessages(en)}>
        <SettingsProvider value={{ settings, setSettings }}>
          <LocationSettings />
        </SettingsProvider>
      </IntlProvider>
    </ChakraProvider>
  );

describe('LocationSettings', () => {
  it('shows the seeded coordinates', () => {
    renderUI({ latitude: 41.9, longitude: 12.5 }, () => {});
    expect(screen.getByDisplayValue('41.9')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12.5')).toBeInTheDocument();
  });

  it('lets you type a full coordinate and commits it on blur, with no private save button', async () => {
    const setSettings = jest.fn();
    renderUI({ latitude: null, longitude: null }, setSettings);

    // Textboxes are: [0] city search, [1] latitude, [2] longitude.
    const lat = screen.getAllByRole('textbox')[1];

    // A decimal (or a leading "-") must survive editing — the old code wrote
    // Number() to settings on every keystroke, turning "41." into 41 and "-"
    // into NaN. The local text buffer accumulates it verbatim.
    await userEvent.type(lat, '41.9');
    expect(lat).toHaveValue('41.9');

    // …and is committed to the shared settings only on blur, as a number.
    await userEvent.tab();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ latitude: 41.9 }));
  });
});
