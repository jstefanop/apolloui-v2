import {
  Badge,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { MdCheckCircle, MdError } from 'react-icons/md';
import Card from '../card/Card';
import { GET_MQTT_QUERY, SET_MQTT_QUERY, TEST_MQTT_QUERY } from '../../graphql/mqtt';

/**
 * MQTT broker + output — a system-level setting (Settings → MQTT).
 *
 * The broker connection and the published telemetry (Home Assistant discovery)
 * belong to the whole device, not just the automation, so they live here. The
 * automation's input signals are edited on the Automation page instead.
 */
const MqttSettingsCard = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const { data, refetch } = useQuery(GET_MQTT_QUERY, { fetchPolicy: 'network-only' });
  const [saveMqtt, { loading: saving }] = useLazyQuery(SET_MQTT_QUERY, { fetchPolicy: 'no-cache' });
  const [testMqtt, { loading: testing }] = useLazyQuery(TEST_MQTT_QUERY, { fetchPolicy: 'no-cache' });

  const config = data?.Mqtt?.config?.result;

  const [draft, setDraft] = useState({
    enabled: false,
    host: '',
    port: 1883,
    username: '',
    password: '',
    tls: false,
    output: { enabled: false, control: true },
  });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (!config) return;
    setDraft({
      enabled: !!config.enabled,
      host: config.host || '',
      port: config.port || 1883,
      username: config.username || '',
      password: '', // never returned; blank means "unchanged"
      tls: !!config.tls,
      output: { enabled: !!config.output?.enabled, control: config.output?.control !== false },
    });
  }, [config]);

  const brokerInput = () => ({
    enabled: draft.enabled,
    host: draft.host || null,
    port: Number(draft.port) || 1883,
    username: draft.username || null,
    ...(draft.password ? { password: draft.password } : {}),
    tls: draft.tls,
  });

  const runTest = async () => {
    setTestResult(null);
    const { data: d } = await testMqtt({ variables: { input: brokerInput() } });
    const r = d?.Mqtt?.testConnection;
    if (r?.error) setTestResult({ ok: false, message: r.error.message });
    else setTestResult({ ok: r?.result?.ok, message: r?.result?.message });
  };

  const save = async () => {
    await saveMqtt({
      variables: {
        input: {
          ...brokerInput(),
          output: { enabled: draft.output.enabled, control: draft.output.control },
        },
      },
    });
    await refetch();
  };

  const status = config?.status;
  const deviceId = config?.output?.deviceId;

  const statusBadge = () => {
    if (!draft.enabled) return null;
    if (status?.connected) return <Badge colorScheme="green">{intl.formatMessage({ id: 'automation.mqtt.connected' })}</Badge>;
    return <Badge colorScheme="red">{status?.error || intl.formatMessage({ id: 'automation.mqtt.disconnected' })}</Badge>;
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
            <Switch isChecked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} colorScheme="green" />
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
          <Flex direction="column" pr="12px">
            <Text fontSize="sm" fontWeight="600" color={textColor}>{intl.formatMessage({ id: 'automation.mqtt.output' })}</Text>
            <Text fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.output_hint' })}</Text>
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
                <FormLabel fontSize="sm" mb="2px" color={textColor}>{intl.formatMessage({ id: 'automation.mqtt.output_control' })}</FormLabel>
                <Text fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.output_control_hint' })}</Text>
              </Flex>
              <Switch
                isChecked={draft.output.control}
                onChange={(e) => setDraft((d) => ({ ...d, output: { ...d.output, control: e.target.checked } }))}
                colorScheme="green"
              />
            </FormControl>
            {deviceId && (
              <Text fontSize="xs" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.mqtt.output_device' }, { id: <b>{deviceId}</b> })}
              </Text>
            )}
          </Flex>
        )}

        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex align="center" gap="8px" minH="20px">
            {testing && <Text fontSize="sm" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.testing' })}</Text>}
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
            <Button size="sm" variant="brand" onClick={save} isLoading={saving}>
              {intl.formatMessage({ id: 'automation.actions.save' })}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default MqttSettingsCard;
