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
import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { MdCheckCircle, MdError } from 'react-icons/md';
import Card from '../card/Card';
import { TEST_MQTT_QUERY } from '../../graphql/mqtt';

/**
 * MQTT broker + output — a system-level setting (Settings → MQTT).
 *
 * Controlled: the editable values live in the Settings page state so they ride
 * its save/discard bar like the timezone and device location. `status`/`deviceId`
 * are live, read from the server config (not edited here).
 */
const MqttSettingsCard = ({ value, onChange, status, deviceId }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const [testMqtt, { loading: testing }] = useLazyQuery(TEST_MQTT_QUERY, { fetchPolicy: 'no-cache' });
  const [testResult, setTestResult] = useState(null);

  const v = value || { enabled: false, host: '', port: 1883, username: '', password: '', tls: false, output: { enabled: false, control: true } };
  const set = (patch) => onChange({ ...v, ...patch });
  const setOutput = (patch) => onChange({ ...v, output: { ...v.output, ...patch } });

  const brokerInput = () => ({
    enabled: v.enabled,
    host: v.host || null,
    port: Number(v.port) || 1883,
    username: v.username || null,
    ...(v.password ? { password: v.password } : {}),
    tls: v.tls,
  });

  const runTest = async () => {
    setTestResult(null);
    const { data } = await testMqtt({ variables: { input: brokerInput() } });
    const r = data?.Mqtt?.testConnection;
    if (r?.error) setTestResult({ ok: false, message: r.error.message });
    else setTestResult({ ok: r?.result?.ok, message: r?.result?.message });
  };

  const statusBadge = () => {
    if (!v.enabled) return null;
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
            <Switch isChecked={v.enabled} onChange={(e) => set({ enabled: e.target.checked })} colorScheme="green" />
          </Flex>
        </Flex>

        <Flex gap="10px" wrap="wrap">
          <FormControl flex="2" minW="180px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.host' })}</FormLabel>
            <Input variant="auth" size="sm" value={v.host} onChange={(e) => set({ host: e.target.value })} placeholder="192.168.1.10" />
          </FormControl>
          <FormControl w="90px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.port' })}</FormLabel>
            <Input variant="auth" size="sm" type="number" value={v.port} onChange={(e) => set({ port: e.target.value })} />
          </FormControl>
          <FormControl w="120px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.username' })}</FormLabel>
            <Input variant="auth" size="sm" value={v.username} onChange={(e) => set({ username: e.target.value })} />
          </FormControl>
          <FormControl w="140px">
            <FormLabel fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.password' })}</FormLabel>
            <Input variant="auth" size="sm" type="password" value={v.password} onChange={(e) => set({ password: e.target.value })} placeholder="••••••" />
          </FormControl>
          <FormControl w="80px" display="flex" flexDirection="column">
            <FormLabel fontSize="xs" color={subTextColor}>TLS</FormLabel>
            <Switch mt="6px" isChecked={v.tls} onChange={(e) => set({ tls: e.target.checked })} />
          </FormControl>
        </Flex>

        <Divider />

        <Flex justify="space-between" align="center" wrap="wrap" gap="8px">
          <Flex direction="column" pr="12px">
            <Text fontSize="sm" fontWeight="600" color={textColor}>{intl.formatMessage({ id: 'automation.mqtt.output' })}</Text>
            <Text fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.output_hint' })}</Text>
          </Flex>
          <Switch isChecked={v.output?.enabled} onChange={(e) => setOutput({ enabled: e.target.checked })} colorScheme="green" />
        </Flex>

        {v.output?.enabled && (
          <Flex bg={rowBg} borderRadius="10px" p="12px" direction="column" gap="10px">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Flex direction="column" pr="12px">
                <FormLabel fontSize="sm" mb="2px" color={textColor}>{intl.formatMessage({ id: 'automation.mqtt.output_control' })}</FormLabel>
                <Text fontSize="xs" color={subTextColor}>{intl.formatMessage({ id: 'automation.mqtt.output_control_hint' })}</Text>
              </Flex>
              <Switch isChecked={v.output?.control} onChange={(e) => setOutput({ control: e.target.checked })} colorScheme="green" />
            </FormControl>
            {deviceId && (
              <Text fontSize="xs" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.mqtt.output_device' }, { id: <b>{deviceId}</b> })}
              </Text>
            )}
          </Flex>
        )}

        <Flex align="center" gap="8px" minH="20px">
          <Button size="sm" variant="light" onClick={runTest} isLoading={testing} isDisabled={!v.host}>
            {intl.formatMessage({ id: 'automation.mqtt.test' })}
          </Button>
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
      </Flex>
    </Card>
  );
};

export default MqttSettingsCard;
