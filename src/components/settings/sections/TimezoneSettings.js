import React, { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  FormControl,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { MdSchedule } from 'react-icons/md';
import moment from 'moment';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { MCU_TIMEZONE_QUERY, MCU_SET_TIMEZONE_QUERY } from '../../../graphql/mcu';
import { sendFeedback } from '../../../redux/slices/feedbackSlice';

/**
 * System timezone.
 *
 * Devices ship with the factory image default and most owners never change it,
 * so the clock is right but the *label* on it is wrong. That skews log
 * timestamps, the timestamps behind the charts, and the hour at which a
 * time-based automation rule fires.
 *
 * Applied immediately, like the WiFi settings: it is a system action, not a
 * value that belongs in the settings save bar.
 */
const TimezoneSettings = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const textColor = useColorModeValue('brands.900', 'white');

  const [selected, setSelected] = useState('');

  const { data, loading, refetch } = useQuery(MCU_TIMEZONE_QUERY, { fetchPolicy: 'no-cache' });
  const [setTimezone, { loading: saving }] = useLazyQuery(MCU_SET_TIMEZONE_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const current = data?.Mcu?.timezone?.result?.timezone;
  const available = data?.Mcu?.timezone?.result?.available || [];

  useEffect(() => {
    if (current) setSelected(current);
  }, [current]);

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isChanged = selected && selected !== current;

  const handleSave = async () => {
    const { data: result } = await setTimezone({ variables: { input: { timezone: selected } } });
    const error = result?.Mcu?.setTimezone?.error;

    if (error) {
      dispatch(sendFeedback({ message: error.message, type: 'error' }));
      return;
    }

    dispatch(
      sendFeedback({
        message: intl.formatMessage({ id: 'settings.sections.system.timezone.saved' }),
        type: 'success',
      })
    );
    await refetch();
  };

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
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              isDisabled={loading || saving}
              size="sm"
            >
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
              { timezone: current || '—', time: moment().format('HH:mm') }
            )}
          </Text>

          {/* The browser knows where the user is; the device often does not. */}
          {detected && detected !== current && (
            <Button
              size="xs"
              variant="link"
              alignSelf="flex-start"
              onClick={() => setSelected(detected)}
            >
              {intl.formatMessage(
                { id: 'settings.sections.system.timezone.use_browser' },
                { timezone: detected }
              )}
            </Button>
          )}

          <Button
            size="sm"
            colorScheme="brand"
            alignSelf="flex-start"
            isDisabled={!isChanged}
            isLoading={saving}
            onClick={handleSave}
          >
            {intl.formatMessage({ id: 'settings.actions.save' })}
          </Button>
        </Flex>
      </SimpleCard>
    </PanelCard>
  );
};

export default TimezoneSettings;
