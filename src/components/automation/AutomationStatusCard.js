import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Switch,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdBolt, MdPause, MdVisibility } from 'react-icons/md';
import moment from 'moment';
import Card from '../card/Card';

// What the engine wants ('off', 'mode:eco', 'none') in the user's words.
const describeTarget = (target, intl) => {
  if (!target || target === 'none') return intl.formatMessage({ id: 'automation.status.target.none' });
  if (target === 'off') return intl.formatMessage({ id: 'automation.status.target.off' });
  return intl.formatMessage(
    { id: 'automation.status.target.mode' },
    { mode: target.replace('mode:', '') }
  );
};

const AutomationStatusCard = ({
  config,
  state,
  onToggleEnabled,
  onToggleDryRun,
  onClearOverride,
  isSaving,
}) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  // Hooks cannot live inside the conditional blocks below.
  const pausedBg = useColorModeValue('orange.50', 'orange.900');
  const dryRunBg = useColorModeValue('blue.50', 'blue.900');

  const decision = state?.decision;
  const guard = state?.guard;
  const miner = state?.miner;

  const overrideActive = config?.overrideUntil && new Date(config.overrideUntil) > new Date();

  return (
    <Card p="20px">
      <Flex direction="column" gap="16px">
        <Flex justify="space-between" align="center" wrap="wrap" gap="12px">
          <Flex direction="column">
            <Text color={textColor} fontSize="lg" fontWeight="700">
              {intl.formatMessage({ id: 'automation.status.title' })}
            </Text>
            <Text color={subTextColor} fontSize="sm">
              {intl.formatMessage({ id: 'automation.status.description' })}
            </Text>
          </Flex>

          <Flex align="center" gap="20px">
            <Flex align="center" gap="8px">
              <Text fontSize="sm" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.status.enabled' })}
              </Text>
              <Switch
                isChecked={!!config?.enabled}
                onChange={(e) => onToggleEnabled(e.target.checked)}
                isDisabled={isSaving}
                colorScheme="green"
              />
            </Flex>

            <Tooltip label={intl.formatMessage({ id: 'automation.status.dry_run.tooltip' })}>
              <Flex align="center" gap="8px">
                <MdVisibility />
                <Text fontSize="sm" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.status.dry_run' })}
                </Text>
                <Switch
                  isChecked={!!config?.dryRun}
                  onChange={(e) => onToggleDryRun(e.target.checked)}
                  isDisabled={isSaving || !config?.enabled}
                  colorScheme="orange"
                />
              </Flex>
            </Tooltip>
          </Flex>
        </Flex>

        {/* The miner does the opposite of what you just clicked: never. A manual
            action pauses the automation, and we say so plainly. */}
        {overrideActive && (
          <Flex
            align="center"
            justify="space-between"
            bg={pausedBg}
            borderRadius="10px"
            p="12px 16px"
            gap="12px"
            wrap="wrap"
          >
            <Flex align="center" gap="10px">
              <MdPause />
              <Text fontSize="sm">
                {intl.formatMessage(
                  { id: 'automation.status.paused' },
                  { time: moment(config.overrideUntil).format('HH:mm') }
                )}
              </Text>
            </Flex>
            <Button size="sm" onClick={onClearOverride} isLoading={isSaving}>
              {intl.formatMessage({ id: 'automation.status.resume' })}
            </Button>
          </Flex>
        )}

        {config?.enabled && config?.dryRun && (
          <Flex
            align="center"
            gap="10px"
            bg={dryRunBg}
            borderRadius="10px"
            p="12px 16px"
          >
            <MdVisibility />
            <Text fontSize="sm">
              {intl.formatMessage({ id: 'automation.status.dry_run.banner' })}
            </Text>
          </Flex>
        )}

        <Divider />

        <Flex gap="28px" wrap="wrap">
          <Box>
            <Text fontSize="xs" color={subTextColor} textTransform="uppercase">
              {intl.formatMessage({ id: 'automation.status.miner' })}
            </Text>
            <Flex align="center" gap="8px" mt="4px">
              <Badge colorScheme={miner?.running ? 'green' : 'gray'}>
                {miner?.running
                  ? intl.formatMessage({ id: 'automation.status.running' })
                  : intl.formatMessage({ id: 'automation.status.stopped' })}
              </Badge>
              {miner?.mode && <Text fontSize="sm">{miner.mode}</Text>}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="xs" color={subTextColor} textTransform="uppercase">
              {intl.formatMessage({ id: 'automation.status.decision' })}
            </Text>
            <Flex align="center" gap="8px" mt="4px">
              <MdBolt />
              <Text fontSize="sm" fontWeight="600">
                {describeTarget(decision?.target, intl)}
              </Text>
              {decision?.ruleName && (
                <Badge colorScheme={decision.reason === 'safety' ? 'red' : 'blue'}>
                  {decision.ruleName}
                </Badge>
              )}
            </Flex>
          </Box>

          {/* A blocked rule is not a broken rule — the difference has to be visible,
              or the first thing a user does is turn the automation off. */}
          {guard?.blockedBy && (
            <Box>
              <Text fontSize="xs" color={subTextColor} textTransform="uppercase">
                {intl.formatMessage({ id: 'automation.status.held_back' })}
              </Text>
              <Flex align="center" gap="8px" mt="4px">
                <Badge colorScheme="orange">{guard.blockedBy}</Badge>
                <Text fontSize="sm" color={subTextColor}>
                  {guard.message}
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default AutomationStatusCard;
