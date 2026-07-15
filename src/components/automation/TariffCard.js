import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { MdAdd, MdDelete } from 'react-icons/md';
import Card from '../card/Card';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Hand-entered energy cost.
 *
 * There is no free worldwide electricity-price API, so typing the tariff in is
 * the baseline that works everywhere, with no key and no account. Spot-price
 * providers can plug in later without changing any of this.
 */
const TariffCard = ({ config, currentPrice, onSave, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');

  const [currency, setCurrency] = useState('EUR');
  const [flatPrice, setFlatPrice] = useState('');
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    if (!config) return;
    setCurrency(config.tariff?.currency || 'EUR');
    setFlatPrice(config.tariff?.flatPrice ?? '');
    setPeriods(
      (config.tariff?.periods || []).map((p) => ({
        days: p.days || [],
        from: p.from,
        to: p.to,
        price: p.price,
        band: p.band || '',
      }))
    );
  }, [config]);

  const setPeriod = (index, patch) =>
    setPeriods((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const toggleDay = (index, day) =>
    setPeriod(index, {
      days: periods[index].days.includes(day)
        ? periods[index].days.filter((d) => d !== day)
        : [...periods[index].days, day].sort(),
    });

  const save = () =>
    onSave({
      tariff: {
        currency,
        flatPrice: flatPrice === '' ? null : Number(flatPrice),
        periods: periods.map((p) => ({
          days: p.days,
          from: p.from,
          to: p.to,
          price: Number(p.price),
          band: p.band || null,
        })),
      },
    });

  return (
    <Card p="20px">
      <Flex direction="column" gap="14px">
        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex direction="column">
            <Text color={textColor} fontSize="lg" fontWeight="700">
              {intl.formatMessage({ id: 'automation.tariff.title' })}
            </Text>
            <Text color={subTextColor} fontSize="sm">
              {intl.formatMessage({ id: 'automation.tariff.description' })}
            </Text>
          </Flex>
          {currentPrice != null && (
            <Badge colorScheme="green" fontSize="sm" p="6px 10px" borderRadius="8px">
              {intl.formatMessage(
                { id: 'automation.tariff.current' },
                { price: currentPrice, currency }
              )}
            </Badge>
          )}
        </Flex>

        <Flex gap="12px" wrap="wrap">
          <FormControl w="120px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.tariff.currency' })}
            </FormLabel>
            <Input variant="auth" size="sm" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </FormControl>

          <FormControl w="180px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.tariff.flat_price' })}
            </FormLabel>
            <Input variant="auth"
              size="sm"
              value={flatPrice}
              onChange={(e) => setFlatPrice(e.target.value)}
              placeholder="0.25"
            />
          </FormControl>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="600" color={textColor}>
            {intl.formatMessage({ id: 'automation.tariff.bands' })}
          </Text>
          <Button
            size="xs"
            variant="light"
            leftIcon={<MdAdd />}
            onClick={() =>
              setPeriods([...periods, { days: [], from: '23:00', to: '07:00', price: '', band: '' }])
            }
          >
            {intl.formatMessage({ id: 'automation.tariff.add_band' })}
          </Button>
        </Flex>

        {periods.map((period, index) => (
          <Flex key={index} bg={rowBg} borderRadius="10px" p="12px" direction="column" gap="8px">
            <Flex gap="8px" align="flex-end" wrap="wrap">
              <FormControl w="110px">
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.tariff.from' })}
                </FormLabel>
                <Input variant="auth"
                  size="sm"
                  value={period.from}
                  onChange={(e) => setPeriod(index, { from: e.target.value })}
                  placeholder="23:00"
                />
              </FormControl>

              <FormControl w="110px">
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.tariff.to' })}
                </FormLabel>
                <Input variant="auth"
                  size="sm"
                  value={period.to}
                  onChange={(e) => setPeriod(index, { to: e.target.value })}
                  placeholder="07:00"
                />
              </FormControl>

              <FormControl w="120px">
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.tariff.price' })}
                </FormLabel>
                <Input variant="auth"
                  size="sm"
                  value={period.price}
                  onChange={(e) => setPeriod(index, { price: e.target.value })}
                  placeholder="0.12"
                />
              </FormControl>

              <FormControl w="140px">
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.tariff.band_name' })}
                </FormLabel>
                <Input variant="auth"
                  size="sm"
                  value={period.band}
                  onChange={(e) => setPeriod(index, { band: e.target.value })}
                  placeholder="night"
                />
              </FormControl>

              <IconButton
                aria-label={intl.formatMessage({ id: 'automation.tariff.remove_band' })}
                icon={<MdDelete />}
                size="sm"
                variant="ghost"
                onClick={() => setPeriods(periods.filter((_, i) => i !== index))}
              />
            </Flex>

            {/* A band crossing midnight belongs to the day it started on — Friday
                night is still Friday at 01:00 on Saturday. */}
            <Flex gap="6px" wrap="wrap">
              {WEEKDAYS.map((day) => (
                <Badge
                  key={day}
                  as="button"
                  onClick={() => toggleDay(index, day)}
                  colorScheme={period.days.includes(day) ? 'brand' : 'gray'}
                  px="8px"
                  py="4px"
                  borderRadius="6px"
                >
                  {intl.formatMessage({ id: `automation.weekday.${day}` })}
                </Badge>
              ))}
              <Text fontSize="xs" color={subTextColor} alignSelf="center">
                {intl.formatMessage({ id: 'automation.tariff.days_hint' })}
              </Text>
            </Flex>
          </Flex>
        ))}

        <Flex justify="flex-end">
          <Button size="sm" variant="brand" onClick={save} isLoading={isSaving}>
            {intl.formatMessage({ id: 'automation.actions.save' })}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default TariffCard;
