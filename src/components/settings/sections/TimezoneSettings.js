import React from 'react';
import {
  Button,
  Flex,
  FormControl,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { MdSchedule } from 'react-icons/md';
import moment from 'moment';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';
import { MCU_TIMEZONE_QUERY } from '../../../graphql/mcu';

/**
 * System timezone.
 *
 * Devices ship with the factory image default and most owners never change it,
 * so the clock is right but the *label* on it is wrong. That skews log
 * timestamps, the timestamps behind the charts, and the hour at which a
 * time-based automation rule fires.
 *
 * Edited into the shared settings state, exactly like the temperature unit:
 * the global save/discard bar picks up the change and applies it on save. No
 * private save button, and nothing restarts.
 */
const TimezoneSettings = () => {
  const intl = useIntl();
  const { settings, setSettings } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');

  // Read-only: fetches the dropdown options and the current system value. The
  // pending selection lives in the settings context, seeded by the settings page.
  const { data, loading } = useQuery(MCU_TIMEZONE_QUERY, { fetchPolicy: 'cache-first' });
  const available = data?.Mcu?.timezone?.result?.available || [];

  const value = settings?.timezone || '';

  const handleChange = (e) => setSettings({ ...settings, timezone: e.target.value });

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.system.timezone.title' })}
      description={intl.formatMessage({ id: 'settings.sections.system.timezone.description' })}
      textColor={textColor}
      icon={MdSchedule}
      mb="20px"
    >
      <SimpleCard textColor={textColor}>
        <Flex direction="column" gap="10px">
          <FormControl>
            <Select variant="auth" value={value} onChange={handleChange} isDisabled={loading} size="sm">
              {/* Keep the current value selectable even before the list resolves. */}
              {value && !available.includes(value) && <option value={value}>{value}</option>}
              {available.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </Select>
          </FormControl>

          <Text fontSize="xs" color="secondaryGray.600">
            {intl.formatMessage(
              { id: 'settings.sections.system.timezone.current' },
              { timezone: value || '—', time: moment().format('HH:mm') }
            )}
          </Text>

          {/* The browser knows where the user is; the device often does not. */}
          {detected && detected !== value && (
            <Button
              size="xs"
              variant="link"
              alignSelf="flex-start"
              onClick={() => setSettings({ ...settings, timezone: detected })}
            >
              {intl.formatMessage(
                { id: 'settings.sections.system.timezone.use_browser' },
                { timezone: detected }
              )}
            </Button>
          )}
        </Flex>
      </SimpleCard>
    </PanelCard>
  );
};

export default TimezoneSettings;
