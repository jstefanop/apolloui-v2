import {
  Badge,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { MdAdd, MdCheckCircle, MdDelete, MdError, MdSearch } from 'react-icons/md';
import Card from '../card/Card';
import { TEST_AUTOMATION_MQTT_QUERY } from '../../graphql/automation';
import MqttBrowseModal from './MqttBrowseModal';

/**
 * MQTT / Home Assistant.
 *
 * Connect to the broker you already run for Home Assistant. Two directions:
 *  - input: map topics to input.<name> signals the rules can react to — e.g. the
 *    solar surplus the SUN2000→MQTT bridge publishes;
 *  - output: publish the device state and (optionally) expose command topics, so
 *    the Apollo shows up in Home Assistant via MQTT Discovery.
 */
const MqttCard = ({ config, onSave, isSaving }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const [draft, setDraft] = useState({
    enabled: false,
    host: '',
    port: 1883,
    username: '',
    password: '',
    tls: false,
    inputs: [],
    output: { enabled: false, control: true },
  });
  const [testResult, setTestResult] = useState(null);
  const [browseOpen, setBrowseOpen] = useState(false);

  const [testMqtt, { loading: testing }] = useLazyQuery(TEST_AUTOMATION_MQTT_QUERY, { fetchPolicy: 'no-cache' });

  const brokerInput = () => ({
    enabled: draft.enabled,
    host: draft.host || null,
    port: Number(draft.port) || 1883,
    username: draft.username || null,
    ...(draft.password ? { password: draft.password } : {}),
    tls: draft.tls,
    inputs: [],
  });

  const runTest = async () => {
    setTestResult(null);
    const { data } = await testMqtt({ variables: { input: brokerInput() } });
    const r = data?.Automation?.testMqtt;
    if (r?.error) setTestResult({ ok: false, message: r.error.message });
    else setTestResult({ ok: r?.result?.ok, message: r?.result?.message });
  };

  useEffect(() => {
    const m = config?.mqtt;
    setDraft({
      enabled: !!m?.enabled,
      host: m?.host || '',
      port: m?.port || 1883,
      username: m?.username || '',
      password: '', // never returned by the API; blank means "unchanged"
      tls: !!m?.tls,
      inputs: (m?.inputs || []).map((i) => ({ name: i.name, topic: i.topic, jsonPath: i.jsonPath || '', unit: i.unit || '' })),
      output: { enabled: !!m?.output?.enabled, control: m?.output?.control !== false },
    });
  }, [config]);

  const status = config?.mqtt?.status;
  const setInput = (i, patch) =>
    setDraft((d) => ({ ...d, inputs: d.inputs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));

  const save = () =>
    onSave({
      mqtt: {
        enabled: draft.enabled,
        host: draft.host || null,
        port: Number(draft.port) || 1883,
        username: draft.username || null,
        // Omit an empty password so the backend keeps the stored one.
        ...(draft.password ? { password: draft.password } : {}),
        tls: draft.tls,
        inputs: draft.inputs
          .filter((x) => x.name && x.topic)
          .map((x) => ({ name: x.name, topic: x.topic, jsonPath: x.jsonPath || null, unit: x.unit || null })),
        output: { enabled: draft.output.enabled, control: draft.output.control },
      },
    });

  const statusBadge = () => {
    if (!draft.enabled) return null;
    if (status?.connected) return <Badge colorScheme="green">{intl.formatMessage({ id: 'automation.mqtt.connected' })}</Badge>;
    return (
      <Badge colorScheme="red">
        {status?.error || intl.formatMessage({ id: 'automation.mqtt.disconnected' })}
      </Badge>
    );
  };

  return (
    <Card p="20px">
      <Flex direction="column" gap="14px">
        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex direction="column">
            <Text color={textColor} fontSize="lg" fontWeight="700">
              {intl.formatMessage({ id: 'automation.mqtt.title' })}
            </Text>
            <Text color={subTextColor} fontSize="sm">
              {intl.formatMessage({ id: 'automation.mqtt.description' })}
            </Text>
          </Flex>
          <Flex align="center" gap="10px">
            {statusBadge()}
            <Switch
              isChecked={draft.enabled}
              onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
              colorScheme="green"
            />
          </Flex>
        </Flex>

        <Flex gap="10px" wrap="wrap">
          <FormControl flex="2" minW="180px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.host' })}</FormLabel>
            <Input variant="auth" size="sm" value={draft.host} onChange={(e) => setDraft({ ...draft, host: e.target.value })} placeholder="192.168.1.10" />
          </FormControl>
          <FormControl w="90px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.port' })}</FormLabel>
            <Input variant="auth" size="sm" type="number" value={draft.port} onChange={(e) => setDraft({ ...draft, port: e.target.value })} />
          </FormControl>
          <FormControl w="120px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.username' })}</FormLabel>
            <Input variant="auth" size="sm" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
          </FormControl>
          <FormControl w="140px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.password' })}</FormLabel>
            <Input variant="auth" size="sm" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="••••••" />
          </FormControl>
          <FormControl w="80px" display="flex" flexDirection="column">
            <FormLabel fontSize="xs" color={subTextColor}>TLS</FormLabel>
            <Switch mt="6px" isChecked={draft.tls} onChange={(e) => setDraft({ ...draft, tls: e.target.checked })} />
          </FormControl>
        </Flex>

        <Divider />

        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Text fontSize="sm" fontWeight="600" color={textColor}>
            {intl.formatMessage({ id: 'automation.mqtt.inputs' })}
          </Text>
          <Flex gap="8px">
            <Button
              size="xs"
              variant="light"
              leftIcon={<MdSearch />}
              onClick={() => setBrowseOpen(true)}
              isDisabled={!draft.host}
            >
              {intl.formatMessage({ id: 'automation.mqtt.browse' })}
            </Button>
            <Button
              size="xs"
              variant="light"
              leftIcon={<MdAdd />}
              onClick={() => setDraft({ ...draft, inputs: [...draft.inputs, { name: '', topic: '', jsonPath: '', unit: '' }] })}
            >
              {intl.formatMessage({ id: 'automation.mqtt.add_input' })}
            </Button>
          </Flex>
        </Flex>

        <MqttBrowseModal
          isOpen={browseOpen}
          onClose={() => setBrowseOpen(false)}
          brokerInput={brokerInput}
          onPick={(input) => setDraft((d) => ({ ...d, inputs: [...d.inputs, input] }))}
        />

        {!draft.inputs.length && (
          <Text fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.inputs_hint' })}</Text>
        )}

        {draft.inputs.map((input, i) => (
          <Flex key={i} bg={rowBg} borderRadius="10px" p="10px" gap="8px" align="flex-end" wrap="wrap">
            <FormControl w="120px">
              <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.name' })}</FormLabel>
              <Input variant="auth" size="sm" value={input.name} onChange={(e) => setInput(i, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} placeholder="surplus" />
            </FormControl>
            <FormControl flex="2" minW="160px">
              <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.topic' })}</FormLabel>
              <Input variant="auth" size="sm" value={input.topic} onChange={(e) => setInput(i, { topic: e.target.value })} placeholder="sun2000/surplus" />
            </FormControl>
            <FormControl w="130px">
              <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.json_path' })}</FormLabel>
              <Input variant="auth" size="sm" value={input.jsonPath} onChange={(e) => setInput(i, { jsonPath: e.target.value })} placeholder="solar.surplus" />
            </FormControl>
            <FormControl w="70px">
              <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.unit' })}</FormLabel>
              <Input variant="auth" size="sm" value={input.unit} onChange={(e) => setInput(i, { unit: e.target.value })} placeholder="W" />
            </FormControl>
            <IconButton
              aria-label={intl.formatMessage({ id: 'automation.mqtt.remove_input' })}
              icon={<MdDelete />}
              size="sm"
              variant="ghost"
              onClick={() => setDraft({ ...draft, inputs: draft.inputs.filter((_, idx) => idx !== i) })}
            />
          </Flex>
        ))}

        <Divider />

        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex direction="column" pr="12px">
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              {intl.formatMessage({ id: 'automation.mqtt.output' })}
            </Text>
            <Text fontSize="xs" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.mqtt.output_hint' })}
            </Text>
          </Flex>
          <Switch
            isChecked={draft.output.enabled}
            onChange={(e) => setDraft((d) => ({ ...d, output: { ...d.output, enabled: e.target.checked } }))}
            colorScheme="green"
          />
        </Flex>

        {draft.output.enabled && (
          <Flex bg={rowBg} borderRadius="10px" p="12px" direction="column" gap="10px">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Flex direction="column" pr="12px">
                <FormLabel fontSize="sm" mb="2px" color={textColor}>
                  {intl.formatMessage({ id: 'automation.mqtt.output_control' })}
                </FormLabel>
                <Text fontSize="xs" color={subTextColor}>
                  {intl.formatMessage({ id: 'automation.mqtt.output_control_hint' })}
                </Text>
              </Flex>
              <Switch
                isChecked={draft.output.control}
                onChange={(e) => setDraft((d) => ({ ...d, output: { ...d.output, control: e.target.checked } }))}
                colorScheme="green"
              />
            </FormControl>
            {config?.mqtt?.output?.deviceId && (
              <Text fontSize="xs" color={subTextColor}>
                {intl.formatMessage(
                  { id: 'automation.mqtt.output_device' },
                  { id: <b>{config.mqtt.output.deviceId}</b> }
                )}
              </Text>
            )}
          </Flex>
        )}

        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex align="center" gap="8px" minH="20px">
            {testing && (
              <Text fontSize="sm" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.mqtt.testing' })}
              </Text>
            )}
            {!testing && testResult && (
              <Flex align="center" gap="6px" color={testResult.ok ? 'green.400' : 'red.400'}>
                {testResult.ok ? <MdCheckCircle /> : <MdError />}
                <Text fontSize="sm">
                  {testResult.ok
                    ? intl.formatMessage({ id: 'automation.mqtt.test_ok' })
                    : testResult.message || intl.formatMessage({ id: 'automation.mqtt.test_failed' })}
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex gap="8px">
            <Button size="sm" variant="light" onClick={runTest} isLoading={testing} isDisabled={!draft.host}>
              {intl.formatMessage({ id: 'automation.mqtt.test' })}
            </Button>
            <Button size="sm" variant="brand" onClick={save} isLoading={isSaving}>
              {intl.formatMessage({ id: 'automation.actions.save' })}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default MqttCard;
