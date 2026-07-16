import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Switch,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Reorder, useDragControls } from 'framer-motion';
import { useIntl } from 'react-intl';
import { MdAdd, MdAutoAwesome, MdDelete, MdDragIndicator, MdEdit, MdShield } from 'react-icons/md';
import Card from '../card/Card';
import { celsiusToUnit, temperatureUnitLabel } from '../../lib/utils';

// Colour each condition chip by the signal's domain, so a glance tells time from
// temperature from energy. Standard Chakra colour schemes (not the dark custom
// "brand") stay legible in both themes.
const CHIP_COLOR = {
  clock: 'blue',
  sun: 'orange',
  miner: 'purple',
  energy: 'teal',
  weather: 'cyan',
  input: 'pink',
};
const chipColor = (signal) => CHIP_COLOR[String(signal).split('.')[0]] || 'gray';

// "Sat, Sun" not "6, 7"; "Daylight: Yes" not "sun.isDay == true"; and words for
// the operator ("greater than") so it can't be misread as "=".
const describeCondition = (condition, descriptors, intl, temperatureUnit = 'c') => {
  const descriptor = descriptors.find((d) => d.id === condition.signal);
  const widget = descriptor?.widget || descriptor?.type;
  // Temperatures are stored in °C; show them in the user's unit.
  const isTemp = descriptor?.unit === '°C';
  const unit = isTemp
    ? ` ${temperatureUnitLabel(temperatureUnit)}`
    : descriptor?.unit
    ? ` ${descriptor.unit}`
    : '';
  const shown = (v) => (isTemp ? celsiusToUnit(v, temperatureUnit) : v);
  const name = condition.signal.startsWith('input.')
    ? intl.formatMessage({ id: 'automation.signal.mqtt_input' }, { name: condition.signal.slice('input.'.length) })
    : intl.formatMessage({ id: `automation.signal.${condition.signal}`, defaultMessage: condition.signal });
  const weekday = (n) => intl.formatMessage({ id: `automation.weekday.${n}`, defaultMessage: n });

  if (widget === 'weekday') {
    const days = (condition.values || []).map(weekday).join(', ');
    return condition.op === 'not_in' ? `${name} ≠ ${days}` : `${name}: ${days}`;
  }
  if (widget === 'boolean') {
    const yesNo = intl.formatMessage({ id: condition.value === 'false' ? 'automation.editor.no' : 'automation.editor.yes' });
    return `${name}: ${yesNo}`;
  }
  if (condition.op === 'between' || condition.op === 'not_between') {
    const [from, to] = condition.values || [];
    return condition.op === 'between' ? `${name} ${from}–${to}` : `${name} ∉ ${from}–${to}`;
  }
  if (condition.op === 'in' || condition.op === 'not_in') {
    const vals = (condition.values || []).join(', ');
    return condition.op === 'in' ? `${name}: ${vals}` : `${name} ≠ ${vals}`;
  }
  if (condition.op === '==') return `${name}: ${shown(condition.value)}${unit}`;
  if (condition.op === '!=') return `${name} ≠ ${shown(condition.value)}${unit}`;
  const opLabel = intl.formatMessage({ id: `automation.op.${condition.op}`, defaultMessage: condition.op });
  return `${name} ${opLabel} ${shown(condition.value)}${unit}`;
};

const describeAction = (action, intl) => {
  if (!action) return '';
  if (action.type === 'off') return intl.formatMessage({ id: 'automation.rule.action.off' });
  return intl.formatMessage({ id: 'automation.rule.action.mode' }, { mode: action.mode });
};

// One draggable row. Order in the list IS the priority, so a drag handle makes
// precedence visible and adjustable — the thing that was invisible before.
const SortableRule = ({ rule, descriptors, temperatureUnit, activeRuleId, onEdit, onToggle, onDelete, onDragEnd, isSaving }) => {
  const intl = useIntl();
  const controls = useDragControls();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const activeBg = useColorModeValue('green.50', 'green.900');

  return (
    <Reorder.Item
      value={rule}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      as="div"
      style={{ listStyle: 'none' }}
    >
      <Flex
        bg={rule.id === activeRuleId ? activeBg : rowBg}
        borderRadius="10px"
        p="12px 14px"
        align="center"
        gap="10px"
        opacity={rule.enabled ? 1 : 0.55}
      >
        <Icon
          as={MdDragIndicator}
          boxSize="20px"
          color={subTextColor}
          cursor="grab"
          aria-label={intl.formatMessage({ id: 'automation.rules.drag' })}
          onPointerDown={(e) => controls.start(e)}
          style={{ touchAction: 'none' }}
        />

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

          <Flex align="center" gap="6px" wrap="wrap" mt="6px">
            <Text fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.rule.if' })}
            </Text>

            {(rule.conditions || []).map((condition, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <Text fontSize="xs" color={subTextColor}>
                    {intl
                      .formatMessage({ id: rule.match === 'any' ? 'automation.rule.or' : 'automation.rule.and' })
                      .trim()}
                  </Text>
                )}
                <Tag size="sm" variant="subtle" colorScheme={chipColor(condition.signal)} borderRadius="full">
                  {describeCondition(condition, descriptors, intl, temperatureUnit)}
                </Tag>
              </Fragment>
            ))}

            <Text fontSize="sm" color={subTextColor}>→</Text>

            <Tag
              size="sm"
              variant="subtle"
              colorScheme={rule.action?.type === 'off' ? 'red' : 'green'}
              borderRadius="full"
            >
              {describeAction(rule.action, intl)}
            </Tag>
          </Flex>
        </Box>

        <Flex align="center" gap="4px">
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
    </Reorder.Item>
  );
};

const RulesList = ({ rules, descriptors, temperatureUnit, activeRuleId, onCreate, onBrowseTemplates, onEdit, onToggle, onDelete, onReorder, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  // Local order drives the drag; it re-syncs whenever the saved rules change.
  const [order, setOrder] = useState(rules || []);
  const orderRef = useRef(order);
  useEffect(() => setOrder(rules || []), [rules]);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Persist once the drag ends, using the latest order (not a stale closure).
  const persist = () => {
    if (onReorder) onReorder(orderRef.current);
  };

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
        <Flex gap="8px">
          {onBrowseTemplates && (
            <Button leftIcon={<MdAutoAwesome />} variant="light" size="sm" onClick={onBrowseTemplates}>
              {intl.formatMessage({ id: 'automation.templates.browse' })}
            </Button>
          )}
          <Button leftIcon={<MdAdd />} variant="brand" size="sm" onClick={onCreate}>
            {intl.formatMessage({ id: 'automation.rules.add' })}
          </Button>
        </Flex>
      </Flex>

      {!order.length ? (
        <Box bg={rowBg} borderRadius="10px" p="20px" textAlign="center">
          <Text fontSize="sm" color={subTextColor}>
            {intl.formatMessage({ id: 'automation.rules.empty' })}
          </Text>
        </Box>
      ) : (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={setOrder}
          as="div"
          style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}
        >
          {order.map((rule) => (
            <SortableRule
              key={rule.id}
              rule={rule}
              descriptors={descriptors}
              temperatureUnit={temperatureUnit}
              activeRuleId={activeRuleId}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
              onDragEnd={persist}
              isSaving={isSaving}
            />
          ))}
        </Reorder.Group>
      )}
    </Card>
  );
};

export default RulesList;
