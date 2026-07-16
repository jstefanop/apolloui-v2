import { Flex, Icon, SimpleGrid, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import {
  MdAccessTime,
  MdBolt,
  MdCalendarViewWeek,
  MdCloud,
  MdDarkMode,
  MdDeviceThermostat,
  MdEvent,
  MdRssFeed,
  MdSchedule,
  MdSpeed,
  MdThermostat,
  MdWbSunny,
  MdWbTwilight,
} from 'react-icons/md';
import Card from '../card/Card';
import { celsiusToUnit, temperatureUnitLabel } from '../../lib/utils';

// Same domain palette as the rule chips, for consistency.
const ACCENT = { clock: 'blue', sun: 'orange', miner: 'purple', weather: 'cyan', energy: 'teal', input: 'pink' };
const accentOf = (id) => ACCENT[id.split('.')[0]] || 'gray';

const ICON = {
  'clock.time': MdAccessTime,
  'clock.weekday': MdCalendarViewWeek,
  'clock.date': MdEvent,
  'sun.isDay': MdWbSunny,
  'sun.minutesToSunset': MdWbTwilight,
  'sun.minutesToSunrise': MdWbTwilight,
  'miner.temperature': MdDeviceThermostat,
  'miner.temperatureAvg': MdDeviceThermostat,
  'miner.running': MdBolt,
  'miner.mode': MdSpeed,
  'weather.temperature': MdThermostat,
  'weather.cloudCover': MdCloud,
  'weather.solarRadiation': MdWbSunny,
  'energy.price': MdBolt,
  'energy.band': MdSchedule,
};
const iconOf = (id) => ICON[id] || (id.startsWith('input.') ? MdRssFeed : MdSchedule);

const CurrentConditionsCard = ({ signals, descriptors, temperatureUnit = 'c', currency = 'EUR' }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const tileBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');

  if (!signals || !signals.length) return null;

  const descriptorFor = (id) => descriptors.find((d) => d.id === id);

  const label = (id) =>
    id.startsWith('input.')
      ? intl.formatMessage({ id: 'automation.signal.mqtt_input' }, { name: id.slice('input.'.length) })
      : intl.formatMessage({ id: `automation.signal.${id}`, defaultMessage: id });

  const yesNo = (v) => intl.formatMessage({ id: v === 'true' ? 'automation.editor.yes' : 'automation.editor.no' });
  const minutes = (v) => {
    const m = Math.round(Number(v));
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  };

  // Value in the user's words/units for a given signal.
  const format = (id, value) => {
    const d = descriptorFor(id);
    if (id === 'clock.weekday') return intl.formatMessage({ id: `automation.weekday.${value}`, defaultMessage: value });
    if (id === 'sun.isDay' || id === 'miner.running') return yesNo(value);
    if (id === 'sun.minutesToSunset' || id === 'sun.minutesToSunrise') return minutes(value);
    if (id === 'energy.price') return `${value} ${currency}/kWh`;
    if (d && d.unit === '°C') return `${celsiusToUnit(value, temperatureUnit)} ${temperatureUnitLabel(temperatureUnit)}`;
    if (d && d.unit) return `${value} ${d.unit}`;
    return String(value);
  };

  return (
    <Card p="20px">
      <Text color={textColor} fontSize="lg" fontWeight="700" mb="14px">
        {intl.formatMessage({ id: 'automation.conditions.title' })}
      </Text>

      <SimpleGrid columns={{ base: 2, md: 4, xl: 6 }} spacing="12px">
        {signals.map((s) => {
          const accent = accentOf(s.id);
          return (
            <Flex
              key={s.id}
              direction="column"
              gap="4px"
              bg={tileBg}
              borderRadius="12px"
              p="12px"
              opacity={s.stale && !s.pending ? 0.45 : 1}
            >
              <Flex align="center" gap="6px" minW="0">
                <Icon as={iconOf(s.id)} color={`${accent}.400`} boxSize="16px" />
                <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                  {label(s.id)}
                </Text>
              </Flex>
              {s.stale && s.pending ? (
                <Flex align="center" gap="6px" h="27px">
                  <Spinner size="sm" color={`${accent}.400`} thickness="2px" speed="0.7s" />
                  <Text fontSize="xs" color={subTextColor}>
                    {intl.formatMessage({ id: 'automation.conditions.loading' })}
                  </Text>
                </Flex>
              ) : (
                <Text fontSize="lg" fontWeight="700" color={textColor} noOfLines={1}>
                  {s.stale ? '—' : format(s.id, s.value)}
                </Text>
              )}
            </Flex>
          );
        })}
      </SimpleGrid>
    </Card>
  );
};

export default CurrentConditionsCard;
