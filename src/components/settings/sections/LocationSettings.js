import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdMyLocation, MdSearch } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';

// Free, no API key, CORS-enabled. Turns a place name into coordinates so the user
// never has to look up latitude/longitude. Used only at setup time — the
// automation computes sunrise/sunset offline from the stored coordinates.
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const placeLabel = (r) =>
  [r.name, r.admin1, r.country].filter(Boolean).join(', ');

/**
 * Device location.
 *
 * Only the automation uses it (sunrise/sunset for the sun signals), but it is
 * device configuration like the timezone, so it lives here and rides the global
 * save/discard bar. Search a city, or type the coordinates by hand; never
 * inferred from the IP.
 */
const LocationSettings = () => {
  const intl = useIntl();
  const { settings, setSettings } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');
  const menuBg = useColorModeValue('white', 'navy.700');
  const menuHover = useColorModeValue('secondaryGray.100', 'whiteAlpha.100');

  // The coordinate inputs keep their own text buffer so a partial value like "-"
  // or "41." survives editing — writing Number() to settings on every keystroke
  // turned "-" into NaN and swallowed the trailing decimal. Committed on blur.
  const [latStr, setLatStr] = useState(settings?.latitude != null ? String(settings.latitude) : '');
  const [lngStr, setLngStr] = useState(settings?.longitude != null ? String(settings.longitude) : '');

  // Re-sync a buffer when the coordinate changes from outside (search / detect),
  // but not mid-edit — the current text already parses to that number.
  useEffect(() => {
    const lat = settings?.latitude;
    setLatStr((s) => (lat == null ? '' : Number(s) === lat ? s : String(lat)));
  }, [settings?.latitude]);
  useEffect(() => {
    const lng = settings?.longitude;
    setLngStr((s) => (lng == null ? '' : Number(s) === lng ? s : String(lng)));
  }, [settings?.longitude]);

  const commitCoord = (key, str) => {
    const n = Number(str);
    setSettings({ ...settings, [key]: str.trim() === '' || !Number.isFinite(n) ? null : n });
  };

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const debounce = useRef();

  // Debounced lookup. Aborts the in-flight request when the query changes so a
  // slow response can't overwrite a newer one.
  useEffect(() => {
    clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      setFailed(false);
      return;
    }

    const controller = new AbortController();
    debounce.current = setTimeout(async () => {
      setSearching(true);
      setFailed(false);
      try {
        const url = `${GEOCODE_URL}?name=${encodeURIComponent(q)}&count=5&language=${intl.locale}&format=json`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        if (e.name !== 'AbortError') setFailed(true);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(debounce.current);
    };
  }, [query, intl.locale]);

  const pick = (r) => {
    setSettings({
      ...settings,
      latitude: Number(r.latitude.toFixed(4)),
      longitude: Number(r.longitude.toFixed(4)),
    });
    setQuery(placeLabel(r));
    setResults([]);
  };

  const detect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setSettings({
        ...settings,
        latitude: Number(position.coords.latitude.toFixed(4)),
        longitude: Number(position.coords.longitude.toFixed(4)),
      });
    });
  };

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.system.location.title' })}
      description={intl.formatMessage({ id: 'settings.sections.system.location.description' })}
      textColor={textColor}
      icon={MdMyLocation}
      mb="20px"
    >
      <SimpleCard textColor={textColor}>
        <Flex direction="column" gap="12px">
          {/* Primary: search a city → coordinates fill in automatically. */}
          <FormControl position="relative">
            <FormLabel fontSize="xs" color="secondaryGray.600">
              {intl.formatMessage({ id: 'settings.sections.system.location.search' })}
            </FormLabel>
            <InputGroup>
              <Input
                variant="auth"
                size="sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={intl.formatMessage({ id: 'settings.sections.system.location.search_placeholder' })}
              />
              <InputRightElement h="32px">
                {searching ? <Spinner size="xs" /> : <MdSearch color="gray" />}
              </InputRightElement>
            </InputGroup>

            {results.length > 0 && (
              <Box
                position="absolute"
                zIndex="10"
                mt="4px"
                w="100%"
                bg={menuBg}
                borderRadius="10px"
                boxShadow="lg"
                overflow="hidden"
              >
                {results.map((r) => (
                  <Box
                    key={r.id}
                    as="button"
                    type="button"
                    display="block"
                    w="100%"
                    textAlign="left"
                    px="12px"
                    py="8px"
                    fontSize="sm"
                    _hover={{ bg: menuHover }}
                    onClick={() => pick(r)}
                  >
                    {placeLabel(r)}
                  </Box>
                ))}
              </Box>
            )}

            {failed && (
              <Text fontSize="xs" color="orange.400" mt="4px">
                {intl.formatMessage({ id: 'settings.sections.system.location.search_failed' })}
              </Text>
            )}
          </FormControl>

          {/* Secondary: the resolved coordinates, still editable for precision. */}
          <Flex gap="10px" wrap="wrap" align="flex-end">
            <FormControl w="120px">
              <FormLabel fontSize="xs" color="secondaryGray.600">
                {intl.formatMessage({ id: 'settings.sections.system.location.latitude' })}
              </FormLabel>
              <Input
                variant="auth"
                size="sm"
                inputMode="decimal"
                value={latStr}
                onChange={(e) => setLatStr(e.target.value)}
                onBlur={() => commitCoord('latitude', latStr)}
              />
            </FormControl>

            <FormControl w="120px">
              <FormLabel fontSize="xs" color="secondaryGray.600">
                {intl.formatMessage({ id: 'settings.sections.system.location.longitude' })}
              </FormLabel>
              <Input
                variant="auth"
                size="sm"
                inputMode="decimal"
                value={lngStr}
                onChange={(e) => setLngStr(e.target.value)}
                onBlur={() => commitCoord('longitude', lngStr)}
              />
            </FormControl>

            <Button size="sm" variant="light" leftIcon={<MdMyLocation />} onClick={detect}>
              {intl.formatMessage({ id: 'settings.sections.system.location.detect' })}
            </Button>
          </Flex>

          <Text fontSize="xs" color="secondaryGray.600">
            {intl.formatMessage({ id: 'settings.sections.system.location.hint' })}
          </Text>
        </Flex>
      </SimpleCard>
    </PanelCard>
  );
};

export default LocationSettings;
