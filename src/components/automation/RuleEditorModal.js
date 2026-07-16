import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdAdd, MdDelete } from 'react-icons/md';
import {
  celsiusToUnit,
  unitToCelsius,
  celsiusDeltaToUnit,
  unitDeltaToCelsius,
  temperatureUnitLabel,
} from '../../lib/utils';

const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'];

// Temperature signals are marked by their canonical °C unit; their values are
// shown/entered in the user's unit and stored back in °C.
const isTemp = (descriptor) => descriptor?.unit === '°C';

// Fallback only — the real list comes from the backend miner.mode descriptor.
const FALLBACK_MODES = ['eco', 'balanced', 'turbo', 'custom'];

const emptyRule = {
  name: '',
  enabled: true,
  priority: 100,
  isSafety: false,
  match: 'all',
  conditions: [],
  action: { type: 'off', mode: null },
};

const widgetOf = (descriptor) => descriptor?.widget || descriptor?.type || 'text';
const isRangeOp = (op) => op === 'between' || op === 'not_between';
const isListOp = (op) => op === 'in' || op === 'not_in';

// Sensible starting point for a fresh condition, per widget. `bands` supplies the
// options for the (dynamic) tariff-band widget.
const defaultCondition = (descriptor, bands = []) => {
  const base = { signal: descriptor.id, value: '', values: [], hysteresis: null };
  switch (widgetOf(descriptor)) {
    case 'weekday':
      return { ...base, op: 'in' };
    case 'boolean':
      return { ...base, op: '==', value: 'true' };
    case 'enum':
      return { ...base, op: '==', value: descriptor.options?.[0] ?? '' };
    case 'band':
      return { ...base, op: '==', value: bands[0] ?? '' };
    case 'time':
      return { ...base, op: descriptor.ops.includes('between') ? 'between' : descriptor.ops[0] };
    default:
      return { ...base, op: descriptor.ops[0] };
  }
};

const RuleEditorModal = ({ isOpen, onClose, onSave, rule, descriptors, bands = [], temperatureUnit = 'c', isSaving }) => {
  const intl = useIntl();
  const [draft, setDraft] = useState(emptyRule);

  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');

  // Single source of truth: the modes come from the backend descriptor, so when
  // Apollo III adds one, this list follows without any UI change.
  const minerModes = descriptors.find((d) => d.id === 'miner.mode')?.options || FALLBACK_MODES;

  // The tariff-band condition can only be offered when at least one band exists.
  const addableSignals = descriptors.filter((d) => widgetOf(d) !== 'band' || bands.length > 0);

  const descriptorFor = (id) => descriptors.find((d) => d.id === id);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(
      rule
        ? {
            ...rule,
            // Stored °C → the user's unit for display; converted back on save.
            conditions: (rule.conditions || []).map((c) => {
              const base = { ...c, values: c.values || [] };
              if (!isTemp(descriptorFor(c.signal))) return base;
              return {
                ...base,
                value: celsiusToUnit(c.value, temperatureUnit),
                hysteresis: celsiusDeltaToUnit(c.hysteresis, temperatureUnit),
              };
            }),
            action: { ...rule.action },
          }
        : emptyRule
    );
  }, [isOpen, rule, temperatureUnit]);

  const setCondition = (index, patch) =>
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));

  const addCondition = () => {
    if (!addableSignals.length) return;
    setDraft((d) => ({ ...d, conditions: [...d.conditions, defaultCondition(addableSignals[0], bands)] }));
  };

  const removeCondition = (index) =>
    setDraft((d) => ({ ...d, conditions: d.conditions.filter((_, i) => i !== index) }));

  // User-defined MQTT inputs get a friendly "MQTT: <name>" label instead of the
  // raw "input.<name>" id.
  const label = (id) =>
    id.startsWith('input.')
      ? intl.formatMessage({ id: 'automation.signal.mqtt_input' }, { name: id.slice('input.'.length) })
      : intl.formatMessage({ id: `automation.signal.${id}`, defaultMessage: id });

  // Values travel to the backend as strings; the engine casts them by signal type.
  // Temperatures are converted from the user's unit back to the canonical °C.
  const save = () => {
    const conditions = draft.conditions.map((c) => {
      const descriptor = descriptorFor(c.signal);
      const range = isRangeOp(c.op) || isListOp(c.op);
      const temp = isTemp(descriptor);

      let value = range ? null : String(c.value ?? '');
      if (temp && value !== null && value !== '') value = String(unitToCelsius(value, temperatureUnit));

      let hysteresis = c.hysteresis === '' || c.hysteresis === null ? null : Number(c.hysteresis);
      if (temp && hysteresis !== null) hysteresis = unitDeltaToCelsius(hysteresis, temperatureUnit);

      return {
        signal: c.signal,
        op: c.op,
        value,
        values: range ? (c.values || []).map(String) : null,
        hysteresis,
      };
    });

    onSave({
      id: draft.id,
      input: {
        name: draft.name,
        enabled: draft.enabled,
        // Priority is set by the rules list order (drag to reorder), not here.
        isSafety: draft.isSafety,
        match: draft.match,
        conditions,
        action:
          draft.action.type === 'off'
            ? { type: 'off' }
            : { type: 'mode', mode: draft.action.mode || minerModes[0] },
      },
    });
  };

  // A rule that turns the miner on must be evaluable while it is off. Board
  // temperature (availableWhileOff === false) is unreadable then, so such a rule
  // could never fire — block it and say why. Mirrors the backend validation.
  const runningOnlyOffenders =
    draft.action.type === 'mode'
      ? draft.conditions.filter((c) => descriptorFor(c.signal)?.availableWhileOff === false).map((c) => c.signal)
      : [];
  const cannotFireWhileOff =
    runningOnlyOffenders.length > 0 &&
    ((draft.match || 'all') === 'all' || runningOnlyOffenders.length === draft.conditions.length);

  const canSave = draft.name?.trim() && draft.conditions.length > 0 && !cannotFireWhileOff;

  // The value control for a condition, chosen by the signal's widget.
  const renderValue = (condition, descriptor, index) => {
    const widget = widgetOf(descriptor);
    const range = isRangeOp(condition.op);

    if (widget === 'weekday') {
      const selected = condition.values || [];
      const toggle = (day) =>
        setCondition(index, {
          values: selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort(),
        });
      return (
        <Flex gap="4px" wrap="wrap" flex="1">
          {WEEKDAYS.map((day) => (
            <Button
              key={day}
              size="xs"
              minW="42px"
              px="6px"
              variant={selected.includes(day) ? 'brand' : 'light'}
              onClick={() => toggle(day)}
            >
              {intl.formatMessage({ id: `automation.weekday.${day}` })}
            </Button>
          ))}
        </Flex>
      );
    }

    if (widget === 'boolean') {
      return (
        <Select
          variant="auth"
          size="sm"
          w="120px"
          value={condition.value ?? 'true'}
          onChange={(e) => setCondition(index, { value: e.target.value })}
        >
          <option value="true">{intl.formatMessage({ id: 'automation.editor.yes' })}</option>
          <option value="false">{intl.formatMessage({ id: 'automation.editor.no' })}</option>
        </Select>
      );
    }

    if (widget === 'enum') {
      return (
        <Select
          variant="auth"
          size="sm"
          w="140px"
          value={condition.value ?? minerModes[0]}
          onChange={(e) => setCondition(index, { value: e.target.value })}
        >
          {(descriptor.options || minerModes).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      );
    }

    // Tariff band: the options are the user's own band names from the tariff.
    if (widget === 'band') {
      return (
        <Select
          variant="auth"
          size="sm"
          w="140px"
          value={condition.value ?? bands[0] ?? ''}
          onChange={(e) => setCondition(index, { value: e.target.value })}
        >
          {bands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      );
    }

    if (widget === 'date' || widget === 'time') {
      const inputType = widget; // native date / time picker
      if (range) {
        const vals = condition.values || [];
        return (
          <Flex gap="6px" align="center">
            <Input
              variant="auth"
              size="sm"
              type={inputType}
              value={vals[0] || ''}
              onChange={(e) => setCondition(index, { values: [e.target.value, vals[1] || ''] })}
            />
            <Text fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.editor.and' })}
            </Text>
            <Input
              variant="auth"
              size="sm"
              type={inputType}
              value={vals[1] || ''}
              onChange={(e) => setCondition(index, { values: [vals[0] || '', e.target.value] })}
            />
          </Flex>
        );
      }
      return (
        <Input
          variant="auth"
          size="sm"
          type={inputType}
          w="150px"
          value={condition.value ?? ''}
          onChange={(e) => setCondition(index, { value: e.target.value })}
        />
      );
    }

    // number / text
    return (
      <Input
        variant="auth"
        size="sm"
        w="120px"
        type={widget === 'number' ? 'number' : 'text'}
        step={widget === 'number' ? 'any' : undefined}
        value={condition.value ?? ''}
        onChange={(e) => setCondition(index, { value: e.target.value })}
        placeholder={isTemp(descriptor) ? temperatureUnitLabel(temperatureUnit) : descriptor?.unit || ''}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {rule
            ? intl.formatMessage({ id: 'automation.editor.edit_title' })
            : intl.formatMessage({ id: 'automation.editor.new_title' })}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex direction="column" gap="16px">
            <FormControl>
              <FormLabel fontSize="sm">
                {intl.formatMessage({ id: 'automation.editor.name' })}
              </FormLabel>
              <Input
                variant="auth"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={intl.formatMessage({ id: 'automation.editor.name_placeholder' })}
              />
            </FormControl>

            <Flex gap="16px" wrap="wrap">
              <FormControl w="160px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.match' })}
                </FormLabel>
                <Select
                  variant="auth"
                  value={draft.match}
                  onChange={(e) => setDraft({ ...draft, match: e.target.value })}
                >
                  <option value="all">{intl.formatMessage({ id: 'automation.editor.match_all' })}</option>
                  <option value="any">{intl.formatMessage({ id: 'automation.editor.match_any' })}</option>
                </Select>
              </FormControl>

              <FormControl flex="1" minW="200px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.safety' })}
                </FormLabel>
                <Checkbox
                  isChecked={draft.isSafety}
                  onChange={(e) => setDraft({ ...draft, isSafety: e.target.checked })}
                >
                  <Text fontSize="sm">
                    {intl.formatMessage({ id: 'automation.editor.safety_label' })}
                  </Text>
                </Checkbox>
                {/* Was a tooltip on the checkbox — it got stuck open; an inline
                    hint reads better anyway. */}
                <Text fontSize="xs" color={subTextColor} mt="4px">
                  {intl.formatMessage({ id: 'automation.editor.safety_tooltip' })}
                </Text>
              </FormControl>
            </Flex>

            <Flex justify="space-between" align="center">
              <FormLabel fontSize="sm" mb="0">
                {intl.formatMessage({ id: 'automation.editor.conditions' })}
              </FormLabel>
              <Button size="xs" variant="light" leftIcon={<MdAdd />} onClick={addCondition}>
                {intl.formatMessage({ id: 'automation.editor.add_condition' })}
              </Button>
            </Flex>

            {draft.conditions.map((condition, index) => {
              const descriptor = descriptorFor(condition.signal);
              const widget = widgetOf(descriptor);
              // Offer the addable signals, but never drop the one this condition
              // already uses (e.g. an energy.band rule after its bands were removed).
              const signalOptions = addableSignals.some((d) => d.id === condition.signal)
                ? addableSignals
                : [descriptor, ...addableSignals].filter(Boolean);
              // Weekday and boolean pin their operator, so the op dropdown would
              // only be noise.
              const showOp = !['weekday', 'boolean'].includes(widget) && (descriptor?.ops?.length > 1);

              return (
                <Flex key={index} direction="column" gap="6px" bg={rowBg} borderRadius="10px" p="10px">
                  <Flex gap="8px" align="center" wrap="wrap">
                    <FormControl flex="1" minW="170px" mb="0">
                      <Select
                        variant="auth"
                        size="sm"
                        value={condition.signal}
                        onChange={(e) => {
                          const next = descriptorFor(e.target.value);
                          setCondition(index, defaultCondition(next, bands));
                        }}
                      >
                        {/* Built from the backend descriptors: a new signal shows up
                            here without touching the UI. */}
                        {signalOptions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {label(d.id)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {showOp && (
                      <FormControl w="110px" mb="0">
                        <Select
                          variant="auth"
                          size="sm"
                          value={condition.op}
                          onChange={(e) => setCondition(index, { op: e.target.value, value: '', values: [] })}
                        >
                          {descriptor.ops.map((op) => (
                            <option key={op} value={op}>
                              {intl.formatMessage({ id: `automation.op.${op}`, defaultMessage: op })}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {renderValue(condition, descriptor, index)}

                    {descriptor?.supportsHysteresis && (
                      <Input
                        variant="auth"
                        size="sm"
                        w="110px"
                        type="number"
                        step="any"
                        value={condition.hysteresis ?? ''}
                        onChange={(e) => setCondition(index, { hysteresis: e.target.value })}
                        placeholder={intl.formatMessage({ id: 'automation.editor.hysteresis' })}
                      />
                    )}

                    <IconButton
                      aria-label={intl.formatMessage({ id: 'automation.editor.remove_condition' })}
                      icon={<MdDelete />}
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(index)}
                    />
                  </Flex>

                  {/* Per-condition hint: says in words what this signal reasons about. */}
                  <Text fontSize="xs" color={subTextColor}>
                    {condition.signal.startsWith('input.')
                      ? intl.formatMessage({ id: 'automation.signal_hint.mqtt_input' })
                      : intl.formatMessage({
                          id: `automation.signal_hint.${condition.signal}`,
                          defaultMessage: '',
                        })}
                  </Text>
                </Flex>
              );
            })}

            <Flex gap="16px" wrap="wrap" mt="8px">
              <FormControl w="180px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.action' })}
                </FormLabel>
                <Select
                  variant="auth"
                  value={draft.action.type}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      action: { type: e.target.value, mode: e.target.value === 'mode' ? minerModes[0] : null },
                    })
                  }
                >
                  <option value="off">{intl.formatMessage({ id: 'automation.editor.action_off' })}</option>
                  <option value="mode">{intl.formatMessage({ id: 'automation.editor.action_mode' })}</option>
                </Select>
              </FormControl>

              {draft.action.type === 'mode' && (
                <FormControl w="180px">
                  <FormLabel fontSize="sm">
                    {intl.formatMessage({ id: 'automation.editor.mode' })}
                  </FormLabel>
                  <Select
                    variant="auth"
                    value={draft.action.mode || minerModes[0]}
                    onChange={(e) => setDraft({ ...draft, action: { type: 'mode', mode: e.target.value } })}
                  >
                    {minerModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Flex>

            {draft.action.type === 'mode' && (
              <Text fontSize="xs" color="orange.400">
                {intl.formatMessage({ id: 'automation.editor.mode_restart_warning' })}
              </Text>
            )}

            {cannotFireWhileOff && (
              <Alert status="warning" borderRadius="10px">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  {intl.formatMessage(
                    { id: 'automation.editor.running_only_warning' },
                    { signals: runningOnlyOffenders.map(label).join(', ') }
                  )}
                </AlertDescription>
              </Alert>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter gap="10px">
          <Button variant="ghost" onClick={onClose}>
            {intl.formatMessage({ id: 'automation.editor.cancel' })}
          </Button>
          <Button variant="brand" onClick={save} isDisabled={!canSave} isLoading={isSaving}>
            {intl.formatMessage({ id: 'automation.editor.save' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RuleEditorModal;
