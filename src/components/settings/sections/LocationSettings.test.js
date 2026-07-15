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

  it('writes latitude into the shared settings, with no private save button', async () => {
    const setSettings = jest.fn();
    renderUI({ latitude: null, longitude: null }, setSettings);

    // Textboxes are: [0] city search, [1] latitude, [2] longitude.
    // setSettings is a mock, so the controlled input never accumulates across
    // keystrokes — assert on a single character's onChange.
    const lat = screen.getAllByRole('textbox')[1];
    await userEvent.type(lat, '4');

    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ latitude: 4 }));
  });
});
