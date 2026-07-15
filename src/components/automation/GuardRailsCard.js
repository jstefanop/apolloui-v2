import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
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

const GuardRailsCard = ({ config, onSave, isSaving }) => {
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

        <Flex gap="12px" wrap="wrap">
          {FIELDS.map(({ key, unit }) => (
            <FormControl key={key} w="150px">
              <Tooltip label={intl.formatMessage({ id: `automation.guards.${key}.tooltip` })}>
                <FormLabel fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: `automation.guards.${key}` })}
                  {unit && ` (${unit})`}
                </FormLabel>
              </Tooltip>
              <Input variant="auth"
                size="sm"
                value={draft[key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </FormControl>
          ))}

          <FormControl w="220px">
            <Tooltip label={intl.formatMessage({ id: 'automation.guards.fallback.tooltip' })}>
              <FormLabel fontSize="xs" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.guards.fallback' })}
              </FormLabel>
            </Tooltip>
            <Select variant="auth"
              size="sm"
              value={draft.fallbackAction || 'keep'}
              onChange={(e) => setDraft({ ...draft, fallbackAction: e.target.value })}
            >
              <option value="keep">{intl.formatMessage({ id: 'automation.guards.fallback.keep' })}</option>
              <option value="off">{intl.formatMessage({ id: 'automation.guards.fallback.off' })}</option>
              <option value="on:eco">on:eco</option>
              <option value="on:balanced">on:balanced</option>
              <option value="on:turbo">on:turbo</option>
            </Select>
          </FormControl>
        </Flex>

        <Flex justify="flex-end">
          <Button
            size="sm"
            variant="brand"
            isLoading={isSaving}
            onClick={() =>
              onSave({
                minOnMinutes: Number(draft.minOnMinutes),
                minOffMinutes: Number(draft.minOffMinutes),
                minChangeMinutes: Number(draft.minChangeMinutes),
                maxCyclesPerHour: Number(draft.maxCyclesPerHour),
                defaultHysteresis: Number(draft.defaultHysteresis),
                overrideMinutes: Number(draft.overrideMinutes),
                fallbackAction: draft.fallbackAction,
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

export default GuardRailsCard;
