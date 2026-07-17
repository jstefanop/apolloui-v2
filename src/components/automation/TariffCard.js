import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { MdAdd, MdDelete } from 'react-icons/md';
import Card from '../card/Card';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

// A short list of widely used currencies beats a free-text field that could hold
// anything. ISO 4217 codes; the label carries the symbol for recognition.
const CURRENCIES = [
  ['EUR', '€ EUR'],
  ['USD', '$ USD'],
  ['GBP', '£ GBP'],
  ['JPY', '¥ JPY'],
  ['CHF', 'CHF'],
  ['CAD', '$ CAD'],
  ['AUD', '$ AUD'],
  ['NZD', '$ NZD'],
  ['CNY', '¥ CNY'],
  ['HKD', '$ HKD'],
  ['SGD', '$ SGD'],
  ['SEK', 'SEK'],
  ['NOK', 'NOK'],
  ['DKK', 'DKK'],
  ['PLN', 'PLN'],
  ['CZK', 'CZK'],
  ['HUF', 'HUF'],
  ['RON', 'RON'],
  ['TRY', '₺ TRY'],
  ['BRL', 'R$ BRL'],
  ['MXN', '$ MXN'],
  ['INR', '₹ INR'],
  ['ZAR', 'ZAR'],
  ['AED', 'AED'],
];

/**
 * Hand-entered energy cost.
 *
 * There is no free worldwide electricity-price API, so typing the tariff in is
 * the baseline that works everywhere, with no key and no account. Spot-price
 * providers can plug in later without changing any of this.
 */
const TariffCard = ({ config, currentPrice, currentBand, onSave, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const [currency, setCurrency] = useState('EUR');
  const [flatPrice, setFlatPrice] = useState('');
  const [periods, setPeriods] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!config) return;
    // A currency saved before this was a dropdown (free text like "qwwqw") is not
    // in the list; fall back to EUR so the select and the badge agree.
    const saved = config.tariff?.currency;
    setCurrency(CURRENCIES.some(([code]) => code === saved) ? saved : 'EUR');
    setFlatPrice(config.tariff?.flatPrice ?? '');
    setPeriods(
      (config.tariff?.periods || []).map((p) => ({
        // An empty list historically meant "every day"; surface it as all days
        // selected so the UI never shows a confusing empty state.
        days: p.days && p.days.length ? p.days : [...WEEKDAYS],
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

  const selectAllDays = (index) => setPeriod(index, { days: [...WEEKDAYS] });

  const save = () => {
    // A band with no day would silently never match — block it with a clear message.
    if (periods.some((p) => !p.days.length)) {
      setError(intl.formatMessage({ id: 'automation.tariff.no_days_error' }));
      return;
    }
    // Free-text times: reject anything that is not HH:mm before it reaches the
    // backend (which stores it unvalidated and would just never match).
    const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (periods.some((p) => !HHMM.test(p.from) || !HHMM.test(p.to))) {
      setError(intl.formatMessage({ id: 'automation.tariff.time_error' }));
      return;
    }
    // An empty price is Number('') === 0 — a silent free-energy band. Require one.
    if (periods.some((p) => p.price === '' || p.price == null || !Number.isFinite(Number(p.price)))) {
      setError(intl.formatMessage({ id: 'automation.tariff.price_error' }));
      return;
    }
    setError(null);
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
  };

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
            <Badge colorScheme="green" fontSize="sm" p="6px 10px" borderRadius="8px" textTransform="none">
              {intl.formatMessage({ id: 'automation.tariff.current' }, { price: currentPrice, currency })}
              {/* Show which band is driving the price, so its live nature is visible. */}
              {currentBand && currentBand !== 'flat' ? ` · ${currentBand}` : ''}
            </Badge>
          )}
        </Flex>

        {error && (
          <Alert status="warning" borderRadius="10px" fontSize="sm" py="8px">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Flex gap="12px" wrap="wrap">
          <FormControl w="120px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.tariff.currency' })}
            </FormLabel>
            <Select variant="auth" size="sm" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl w="180px">
            <FormLabel fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.tariff.flat_price' })}
            </FormLabel>
            <Input
              variant="auth"
              size="sm"
              type="number"
              step="0.01"
              min="0"
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
              setPeriods([...periods, { days: [...WEEKDAYS], from: '23:00', to: '07:00', price: '', band: '' }])
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
                <Input
                  variant="auth"
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
                <Input
                  variant="auth"
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
                <Input
                  variant="auth"
                  size="sm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={period.price}
                  onChange={(e) => setPeriod(index, { price: e.target.value })}
                  placeholder="0.12"
                />
              </FormControl>

              <FormControl w="140px">
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.tariff.band_name' })}
                </FormLabel>
                <Input
                  variant="auth"
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
            <Flex gap="6px" wrap="wrap" align="center">
              {WEEKDAYS.map((day) => (
                <Button
                  key={day}
                  size="xs"
                  minW="44px"
                  px="8px"
                  variant={period.days.includes(day) ? 'brand' : 'light'}
                  onClick={() => toggleDay(index, day)}
                >
                  {intl.formatMessage({ id: `automation.weekday.${day}` })}
                </Button>
              ))}
              <Button size="xs" variant="ghost" onClick={() => selectAllDays(index)}>
                {intl.formatMessage({ id: 'automation.tariff.all_days' })}
              </Button>
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
