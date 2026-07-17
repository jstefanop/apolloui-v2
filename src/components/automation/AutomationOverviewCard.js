import { useState } from 'react';
import {
  Badge,
  Flex,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery, useSubscription } from '@apollo/client';
import { useIntl } from 'react-intl';
import { MdAutoMode } from 'react-icons/md';
import Card from '../card/Card';
import { GET_AUTOMATION_STATE_QUERY, AUTOMATION_SUBSCRIPTION } from '../../graphql/automation';
import { useDeviceType } from '../../contexts/DeviceConfigContext';

/**
 * Compact automation summary for the overview page: shown only when the feature
 * is enabled (and never on a solo-node, which has no miner). Status, the rule
 * currently in charge, the current decision, and the dry-run flag — live, from
 * the same subscription the automation page uses.
 */
const AutomationOverviewCard = () => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const fieldBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const { data } = useQuery(GET_AUTOMATION_STATE_QUERY, { fetchPolicy: 'cache-and-network' });
  const [live, setLive] = useState(null);
  useSubscription(AUTOMATION_SUBSCRIPTION, {
    onData: ({ data: pushed }) => {
      const r = pushed?.data?.automation?.result;
      if (r) setLive(r);
    },
  });

  const state = live ?? data?.Automation?.state?.result;

  // Only when the automation is actually armed, and never on a miner-less device.
  if (deviceType === 'solo-node' || !state?.enabled) return null;

  const t = (id, values) => intl.formatMessage({ id: `automation.${id}` }, values);

  const running = !!state.miner?.running;
  const mode = state.miner?.mode;
  const decision = state.decision || {};
  const guard = state.guard || {};

  const ruleInCharge =
    decision.ruleName ||
    (decision.reason === 'override' ? t('overview.paused') : t('overview.none'));

  const decisionLabel = (() => {
    const target = decision.target;
    if (!target || target === 'none') return t('status.target.none');
    if (target === 'off') return t('status.target.off');
    if (target.startsWith('mode:')) return t('status.target.mode', { mode: target.slice(5) });
    return target;
  })();

  const Field = ({ label, children }) => (
    <Flex direction="column" gap="4px" bg={fieldBg} borderRadius="12px" p="12px 14px" minW="0">
      <Text fontSize="xs" color={subTextColor} textTransform="uppercase" letterSpacing="0.04em" noOfLines={1}>
        {label}
      </Text>
      <Flex align="center" gap="8px" wrap="wrap">
        {children}
      </Flex>
    </Flex>
  );

  return (
    <Card mb="20px" px="24px" py="18px">
      <Flex justify="space-between" align="center" mb="14px" wrap="wrap" gap="8px">
        <Flex align="center" gap="10px">
          <Icon as={MdAutoMode} w="22px" h="22px" color="brand.500" />
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            {t('status.title')}
          </Text>
          <Badge colorScheme="green">{t('status.enabled')}</Badge>
          {state.dryRun && <Badge colorScheme="orange">{t('status.dry_run')}</Badge>}
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="12px">
        <Field label={t('status.miner')}>
          <Text fontSize="md" fontWeight="600" color={running ? 'green.400' : subTextColor}>
            {running ? t('status.running') : t('status.stopped')}
            {running && mode ? ` · ${mode}` : ''}
          </Text>
        </Field>

        <Field label={t('overview.rule_in_charge')}>
          <Text fontSize="md" fontWeight="600" color={textColor} noOfLines={1} wordBreak="break-word">
            {ruleInCharge}
          </Text>
        </Field>

        <Field label={t('status.decision')}>
          <Text fontSize="md" fontWeight="600" color={textColor} noOfLines={1}>
            {decisionLabel}
          </Text>
          {guard.blockedBy && (
            <Badge colorScheme="orange" fontSize="0.6rem">
              {t('status.held_back')}
            </Badge>
          )}
        </Field>
      </SimpleGrid>
    </Card>
  );
};

export default AutomationOverviewCard;
