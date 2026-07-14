import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Card from '../card/Card';

/**
 * Coordinates for the sunrise/sunset signals.
 *
 * Typed in, never guessed from the IP address: geolocation by IP is imprecise
 * and drags a privacy question into a feature that does not need one. Without
 * coordinates the sun signals simply report as stale, and rules that use them
 * do not match.
 */
const LocationCard = ({ config, sunSignals, onSave, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (!config) return;
    setLatitude(config.latitude ?? '');
    setLongitude(config.longitude ?? '');
    setTimezone(config.timezone || '');
  }, [config]);

  const detect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toFixed(4));
      setLongitude(position.coords.longitude.toFixed(4));
    });
  };

  const detectTimezone = () => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <Card p="20px">
      <Flex direction="column" gap="14px">
        <Flex direction="column">
          <Text color={textColor} fontSize="lg" fontWeight="700">
            {intl.formatMessage({ id: 'automation.location.title' })}
          </Text>
          <Text color={subTextColor} fontSize="sm">
            {intl.formatMessage({ id: 'automation.location.description' })}
          </Text>
        </Flex>

        <Flex gap="12px" wrap="wrap" align="flex-end">
          <FormControl w="140px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.location.latitude' })}
            </FormLabel>
            <Input size="sm" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </FormControl>

          <FormControl w="140px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.location.longitude' })}
            </FormLabel>
            <Input size="sm" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </FormControl>

          <Button size="sm" variant="outline" onClick={detect}>
            {intl.formatMessage({ id: 'automation.location.detect' })}
          </Button>

          <FormControl w="200px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.location.timezone' })}
            </FormLabel>
            <Input size="sm" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </FormControl>

          <Button size="sm" variant="outline" onClick={detectTimezone}>
            {intl.formatMessage({ id: 'automation.location.detect_timezone' })}
          </Button>
        </Flex>

        {sunSignals?.length > 0 && (
          <Text fontSize="xs" color={subTextColor}>
            {sunSignals
              .map((s) =>
                s.stale
                  ? `${s.id}: ${intl.formatMessage({ id: 'automation.signal.stale' })}`
                  : `${s.id}: ${s.value}`
              )
              .join(' · ')}
          </Text>
        )}

        <Flex justify="flex-end">
          <Button
            size="sm"
            colorScheme="brand"
            isLoading={isSaving}
            onClick={() =>
              onSave({
                latitude: latitude === '' ? null : Number(latitude),
                longitude: longitude === '' ? null : Number(longitude),
                timezone: timezone || null,
              })
            }
          >
            {intl.formatMessage({ id: 'automation.actions.save' })}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default LocationCard;
