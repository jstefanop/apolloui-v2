import { useEffect, useState } from 'react';
import {
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
  NumberInput,
  NumberInputField,
  Select,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdAdd, MdDelete } from 'react-icons/md';

const MINER_MODES = ['eco', 'balanced', 'turbo', 'custom'];

const emptyRule = {
  name: '',
  enabled: true,
  priority: 100,
  isSafety: false,
  match: 'all',
  conditions: [],
  action: { type: 'off', mode: null },
};

const emptyCondition = (descriptor) => ({
  signal: descriptor.id,
  op: descriptor.ops[0],
  value: '',
  values: [],
  hysteresis: null,
});

const needsRange = (op) => op === 'between' || op === 'not_between';
const needsList = (op) => op === 'in' || op === 'not_in';

const RuleEditorModal = ({ isOpen, onClose, onSave, rule, descriptors, isSaving }) => {
  const intl = useIntl();
  const [draft, setDraft] = useState(emptyRule);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(
      rule
        ? {
            ...rule,
            conditions: (rule.conditions || []).map((c) => ({ ...c, values: c.values || [] })),
            action: { ...rule.action },
          }
        : emptyRule
    );
  }, [isOpen, rule]);

  const descriptorFor = (id) => descriptors.find((d) => d.id === id);

  const setCondition = (index, patch) =>
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));

  const addCondition = () => {
    if (!descriptors.length) return;
    setDraft((d) => ({ ...d, conditions: [...d.conditions, emptyCondition(descriptors[0])] }));
  };

  const removeCondition = (index) =>
    setDraft((d) => ({ ...d, conditions: d.conditions.filter((_, i) => i !== index) }));

  // Values travel to the backend as strings; the engine casts them by signal type.
  const save = () => {
    const conditions = draft.conditions.map((c) => ({
      signal: c.signal,
      op: c.op,
      value: needsRange(c.op) || needsList(c.op) ? null : String(c.value ?? ''),
      values: needsRange(c.op) || needsList(c.op) ? (c.values || []).map(String) : null,
      hysteresis: c.hysteresis === '' || c.hysteresis === null ? null : Number(c.hysteresis),
    }));

    onSave({
      id: draft.id,
      input: {
        name: draft.name,
        enabled: draft.enabled,
        priority: Number(draft.priority),
        isSafety: draft.isSafety,
        match: draft.match,
        conditions,
        action:
          draft.action.type === 'off'
            ? { type: 'off' }
            : { type: 'mode', mode: draft.action.mode || 'eco' },
      },
    });
  };

  const canSave = draft.name?.trim() && draft.conditions.length > 0;

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
              <Input variant="auth"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={intl.formatMessage({ id: 'automation.editor.name_placeholder' })}
              />
            </FormControl>

            <Flex gap="16px" wrap="wrap">
              <FormControl w="140px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.priority' })}
                </FormLabel>
                <NumberInput variant="auth"
                  value={draft.priority}
                  onChange={(value) => setDraft({ ...draft, priority: value })}
                  min={0}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl w="160px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.match' })}
                </FormLabel>
                <Select variant="auth"
                  value={draft.match}
                  onChange={(e) => setDraft({ ...draft, match: e.target.value })}
                >
                  <option value="all">{intl.formatMessage({ id: 'automation.editor.match_all' })}</option>
                  <option value="any">{intl.formatMessage({ id: 'automation.editor.match_any' })}</option>
                </Select>
              </FormControl>

              <FormControl flex="1" minW="220px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.safety' })}
                </FormLabel>
                <Tooltip label={intl.formatMessage({ id: 'automation.editor.safety_tooltip' })}>
                  <Checkbox
                    isChecked={draft.isSafety}
                    onChange={(e) => setDraft({ ...draft, isSafety: e.target.checked })}
                  >
                    <Text fontSize="sm">
                      {intl.formatMessage({ id: 'automation.editor.safety_label' })}
                    </Text>
                  </Checkbox>
                </Tooltip>
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
              const ops = descriptor?.ops || [];

              return (
                <Flex key={index} gap="8px" align="flex-end" wrap="wrap">
                  <FormControl flex="2" minW="180px">
                    <Select variant="auth"
                      size="sm"
                      value={condition.signal}
                      onChange={(e) => {
                        const next = descriptorFor(e.target.value);
                        setCondition(index, {
                          signal: e.target.value,
                          op: next?.ops?.[0],
                          value: '',
                          values: [],
                          hysteresis: null,
                        });
                      }}
                    >
                      {/* Built from the backend descriptors: a new signal shows up here
                          without touching the UI. */}
                      {descriptors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {intl.formatMessage({
                            id: `automation.signal.${d.id}`,
                            defaultMessage: d.id,
                          })}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl w="110px">
                    <Select variant="auth"
                      size="sm"
                      value={condition.op}
                      onChange={(e) => setCondition(index, { op: e.target.value, value: '', values: [] })}
                    >
                      {ops.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {needsRange(condition.op) || needsList(condition.op) ? (
                    <FormControl flex="2" minW="160px">
                      <Input variant="auth"
                        size="sm"
                        value={(condition.values || []).join(',')}
                        onChange={(e) =>
                          setCondition(index, {
                            values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                          })
                        }
                        placeholder={
                          needsRange(condition.op)
                            ? intl.formatMessage({ id: 'automation.editor.range_placeholder' })
                            : intl.formatMessage({ id: 'automation.editor.list_placeholder' })
                        }
                      />
                    </FormControl>
                  ) : (
                    <FormControl flex="1" minW="110px">
                      <Input variant="auth"
                        size="sm"
                        value={condition.value ?? ''}
                        onChange={(e) => setCondition(index, { value: e.target.value })}
                        placeholder={descriptor?.unit || ''}
                      />
                    </FormControl>
                  )}

                  {descriptor?.supportsHysteresis && (
                    <FormControl w="120px">
                      <Tooltip label={intl.formatMessage({ id: 'automation.editor.hysteresis_tooltip' })}>
                        <Input variant="auth"
                          size="sm"
                          value={condition.hysteresis ?? ''}
                          onChange={(e) => setCondition(index, { hysteresis: e.target.value })}
                          placeholder={intl.formatMessage({ id: 'automation.editor.hysteresis' })}
                        />
                      </Tooltip>
                    </FormControl>
                  )}

                  <IconButton
                    aria-label={intl.formatMessage({ id: 'automation.editor.remove_condition' })}
                    icon={<MdDelete />}
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCondition(index)}
                  />
                </Flex>
              );
            })}

            <Flex gap="16px" wrap="wrap" mt="8px">
              <FormControl w="180px">
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'automation.editor.action' })}
                </FormLabel>
                <Select variant="auth"
                  value={draft.action.type}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      action: { type: e.target.value, mode: e.target.value === 'mode' ? 'eco' : null },
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
                  <Select variant="auth"
                    value={draft.action.mode || 'eco'}
                    onChange={(e) => setDraft({ ...draft, action: { type: 'mode', mode: e.target.value } })}
                  >
                    {MINER_MODES.map((mode) => (
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
