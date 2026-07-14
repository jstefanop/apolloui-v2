import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdAdd, MdDelete, MdEdit, MdShield } from 'react-icons/md';
import Card from '../card/Card';

// "temperature above 80 °C", not "{signal: miner.temperature, op: '>', value: 80}".
const describeCondition = (condition, descriptors, intl) => {
  const descriptor = descriptors.find((d) => d.id === condition.signal);
  const unit = descriptor?.unit ? ` ${descriptor.unit}` : '';
  const name = intl.formatMessage({
    id: `automation.signal.${condition.signal}`,
    defaultMessage: condition.signal,
  });

  if (condition.op === 'between' || condition.op === 'not_between') {
    const [from, to] = condition.values || [];
    const key = condition.op === 'between' ? 'automation.rule.between' : 'automation.rule.not_between';
    return intl.formatMessage({ id: key }, { signal: name, from, to });
  }

  if (condition.op === 'in' || condition.op === 'not_in') {
    const key = condition.op === 'in' ? 'automation.rule.in' : 'automation.rule.not_in';
    return intl.formatMessage({ id: key }, { signal: name, values: (condition.values || []).join(', ') });
  }

  return `${name} ${condition.op} ${condition.value}${unit}`;
};

const describeAction = (action, intl) => {
  if (!action) return '';
  if (action.type === 'off') return intl.formatMessage({ id: 'automation.rule.action.off' });
  return intl.formatMessage({ id: 'automation.rule.action.mode' }, { mode: action.mode });
};

const RulesList = ({ rules, descriptors, activeRuleId, onCreate, onEdit, onToggle, onDelete, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');
  const activeBg = useColorModeValue('green.50', 'green.900');

  return (
    <Card p="20px">
      <Flex justify="space-between" align="center" mb="16px">
        <Flex direction="column">
          <Text color={textColor} fontSize="lg" fontWeight="700">
            {intl.formatMessage({ id: 'automation.rules.title' })}
          </Text>
          <Text color={subTextColor} fontSize="sm">
            {intl.formatMessage({ id: 'automation.rules.description' })}
          </Text>
        </Flex>
        <Button leftIcon={<MdAdd />} colorScheme="brand" size="sm" onClick={onCreate}>
          {intl.formatMessage({ id: 'automation.rules.add' })}
        </Button>
      </Flex>

      {!rules?.length && (
        <Box bg={rowBg} borderRadius="10px" p="20px" textAlign="center">
          <Text fontSize="sm" color={subTextColor}>
            {intl.formatMessage({ id: 'automation.rules.empty' })}
          </Text>
        </Box>
      )}

      <Flex direction="column" gap="10px">
        {(rules || []).map((rule) => (
          <Flex
            key={rule.id}
            bg={rule.id === activeRuleId ? activeBg : rowBg}
            borderRadius="10px"
            p="14px 16px"
            align="center"
            justify="space-between"
            gap="12px"
            opacity={rule.enabled ? 1 : 0.55}
          >
            <Box flex="1" minW="0">
              <Flex align="center" gap="8px" wrap="wrap">
                <Text fontWeight="600" color={textColor}>
                  {rule.name}
                </Text>
                {rule.isSafety && (
                  <Badge colorScheme="red" display="flex" alignItems="center" gap="4px">
                    <MdShield />
                    {intl.formatMessage({ id: 'automation.rules.safety' })}
                  </Badge>
                )}
                {rule.id === activeRuleId && (
                  <Badge colorScheme="green">
                    {intl.formatMessage({ id: 'automation.rules.active' })}
                  </Badge>
                )}
              </Flex>

              <Text fontSize="sm" color={subTextColor} mt="4px">
                {intl.formatMessage(
                  { id: rule.match === 'any' ? 'automation.rule.if_any' : 'automation.rule.if_all' },
                  {
                    conditions: (rule.conditions || [])
                      .map((c) => describeCondition(c, descriptors, intl))
                      .join(intl.formatMessage({ id: rule.match === 'any' ? 'automation.rule.or' : 'automation.rule.and' })),
                    action: describeAction(rule.action, intl),
                  }
                )}
              </Text>
            </Box>

            <Flex align="center" gap="6px">
              <Switch
                isChecked={rule.enabled}
                onChange={(e) => onToggle(rule, e.target.checked)}
                isDisabled={isSaving}
                colorScheme="green"
                size="sm"
              />
              <IconButton
                aria-label={intl.formatMessage({ id: 'automation.rules.edit' })}
                icon={<MdEdit />}
                size="sm"
                variant="ghost"
                onClick={() => onEdit(rule)}
              />
              <IconButton
                aria-label={intl.formatMessage({ id: 'automation.rules.delete' })}
                icon={<MdDelete />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(rule)}
              />
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};

export default RulesList;
