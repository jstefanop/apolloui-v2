import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Card from '../card/Card';

const FIELDS = [
  { key: 'minOnMinutes', unit: 'min' },
  { key: 'minOffMinutes', unit: 'min' },
  { key: 'minChangeMinutes', unit: 'min' },
  { key: 'maxCyclesPerHour', unit: '/h' },
  { key: 'defaultHysteresis', unit: '' },
  { key: 'overrideMinutes', unit: 'min' },
];

const GuardRailsCard = ({ config, minerModes = [], onSave, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (!config) return;
    setDraft({
      minOnMinutes: config.minOnMinutes,
      minOffMinutes: config.minOffMinutes,
      minChangeMinutes: config.minChangeMinutes,
      maxCyclesPerHour: config.maxCyclesPerHour,
      defaultHysteresis: config.defaultHysteresis,
      overrideMinutes: config.overrideMinutes,
      fallbackAction: config.fallbackAction,
    });
  }, [config]);

  // Only send fields the user actually left set. An emptied number input is
  // Number('') === 0, which would silently disable that guard rail; the backend
  // patches (an omitted key stays unchanged), so skip blank/invalid fields and
  // keep the stored value instead of clobbering it with 0.
  const handleSave = () => {
    const payload = { fallbackAction: draft.fallbackAction };
    for (const { key } of FIELDS) {
      const raw = draft[key];
      if (raw === '' || raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (Number.isFinite(n)) payload[key] = n;
    }
    onSave(payload);
  };

  return (
    <Card p="20px">
      <Flex direction="column" gap="14px">
        <Flex direction="column">
          <Text color={textColor} fontSize="lg" fontWeight="700">
            {intl.formatMessage({ id: 'automation.guards.title' })}
          </Text>
          {/* Why these exist, in one line: an ASIC that is cycled every minute dies. */}
          <Text color={subTextColor} fontSize="sm">
            {intl.formatMessage({ id: 'automation.guards.description' })}
          </Text>
        </Flex>

        {/* Two even columns, so a longer label like "Min interval (min)" has room
            instead of wrapping in the narrow card. */}
        <SimpleGrid columns={2} spacingX="12px" spacingY="10px">
          {FIELDS.map(({ key, unit }) => (
            <FormControl key={key}>
              <Tooltip label={intl.formatMessage({ id: `automation.guards.${key}.tooltip` })}>
                <FormLabel fontSize="xs" color={subTextColor} noOfLines={1}>
                  {intl.formatMessage({ id: `automation.guards.${key}` })}
                  {unit && ` (${unit})`}
                </FormLabel>
              </Tooltip>
              <Input
                variant="auth"
                size="sm"
                type="number"
                value={draft[key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </FormControl>
          ))}

          <FormControl gridColumn="span 2">
            <Tooltip label={intl.formatMessage({ id: 'automation.guards.fallback.tooltip' })}>
              <FormLabel fontSize="xs" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.guards.fallback' })}
              </FormLabel>
            </Tooltip>
            <Select
              variant="auth"
              size="sm"
              value={draft.fallbackAction || 'keep'}
              onChange={(e) => setDraft({ ...draft, fallbackAction: e.target.value })}
            >
              <option value="keep">{intl.formatMessage({ id: 'automation.guards.fallback.keep' })}</option>
              <option value="off">{intl.formatMessage({ id: 'automation.guards.fallback.off' })}</option>
              {/* Modes come from the same backend source of truth as everywhere else. */}
              {minerModes.map((mode) => (
                <option key={mode} value={`on:${mode}`}>
                  on:{mode}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        <Flex justify="flex-end">
          <Button
            size="sm"
            variant="brand"
            isLoading={isSaving}
            onClick={handleSave}
          >
            {intl.formatMessage({ id: 'automation.actions.save' })}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default GuardRailsCard;
