import {
  Badge,
  Button,
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
import { MdCheckCircle, MdError, MdWifiTethering } from 'react-icons/md';
import PanelCard from '../UI/PanelCard';
import SimpleCard from '../UI/SimpleCard';
import SimpleSwitchSettingsItem from '../UI/SimpleSwitchSettingsItem';
import { TEST_MQTT_QUERY } from '../../graphql/mqtt';
import { useDeviceType } from '../../contexts/DeviceConfigContext';

/**
 * MQTT broker + output — a system-level setting (Settings → MQTT).
 *
 * Controlled: the editable values live in the Settings page state so they ride
 * its save/discard bar. Follows the same layout as the other settings sections
 * (PanelCard header, SimpleSwitchSettingsItem toggles, SimpleCard groups).
 */
const MqttSettingsCard = ({ value, onChange, status, deviceId }) => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const hasMiner = deviceType !== 'solo-node';
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  const [testMqtt, { loading: testing }] = useLazyQuery(TEST_MQTT_QUERY, { fetchPolicy: 'no-cache' });
  const [testResult, setTestResult] = useState(null);

  const v = value || { enabled: false, host: '', port: 1883, username: '', password: '', tls: false, output: { enabled: false, control: true, exports: {} } };
  const set = (patch) => onChange({ ...v, ...patch });
  const setOutput = (patch) => onChange({ ...v, output: { ...v.output, ...patch } });
  const exports = v.output?.exports || {};
  const setExport = (domain, val) => setOutput({ exports: { ...exports, [domain]: val } });

  const domains = [...(hasMiner ? ['miner'] : []), 'node', 'solo', 'mcu'];

  const t = (id) => intl.formatMessage({ id: `automation.mqtt.${id}` });

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

  const item = (id, title, description, selected) => ({ id, color: 'green', title, description, selected });

  return (
    <PanelCard title={t('title')} description={t('description')} icon={MdWifiTethering} textColor={textColor}>
      <SimpleSwitchSettingsItem
        item={item('mqttEnabled', t('enable'), t('enable_hint'), v.enabled)}
        textColor={textColor}
        handleSwitch={(e) => set({ enabled: e.target.checked })}
      />

      {v.enabled && (
        <SimpleCard title={t('broker')} textColor={textColor}>
          <Flex gap="10px" wrap="wrap">
            <FormControl flex="2" minW="180px">
              <FormLabel fontSize="xs" color={subTextColor}>{t('host')}</FormLabel>
              <Input variant="auth" size="sm" value={v.host} onChange={(e) => set({ host: e.target.value })} placeholder="192.168.1.10" />
            </FormControl>
            <FormControl w="90px">
              <FormLabel fontSize="xs" color={subTextColor}>{t('port')}</FormLabel>
              <Input variant="auth" size="sm" type="number" value={v.port} onChange={(e) => set({ port: e.target.value })} />
            </FormControl>
            <FormControl w="120px">
              <FormLabel fontSize="xs" color={subTextColor}>{t('username')}</FormLabel>
              <Input variant="auth" size="sm" value={v.username} onChange={(e) => set({ username: e.target.value })} />
            </FormControl>
            <FormControl w="140px">
              <FormLabel fontSize="xs" color={subTextColor}>{t('password')}</FormLabel>
              <Input variant="auth" size="sm" type="password" value={v.password} onChange={(e) => set({ password: e.target.value })} placeholder="••••••" />
            </FormControl>
            <FormControl w="80px" display="flex" flexDirection="column">
              <FormLabel fontSize="xs" color={subTextColor}>TLS</FormLabel>
              <Switch mt="6px" isChecked={v.tls} onChange={(e) => set({ tls: e.target.checked })} />
            </FormControl>
          </Flex>

          <Flex align="center" gap="10px" mt="12px" minH="20px">
            <Button size="sm" variant="light" onClick={runTest} isLoading={testing} isDisabled={!v.host}>
              {t('test')}
            </Button>
            {status?.connected && <Badge colorScheme="green">{t('connected')}</Badge>}
            {!status?.connected && v.enabled && <Badge colorScheme="red">{status?.error || t('disconnected')}</Badge>}
            {!testing && testResult && (
              <Flex align="center" gap="6px" color={testResult.ok ? 'green.400' : 'red.400'}>
                {testResult.ok ? <MdCheckCircle /> : <MdError />}
                <Text fontSize="sm">
                  {testResult.ok ? t('test_ok') : testResult.message || t('test_failed')}
                </Text>
              </Flex>
            )}
          </Flex>
        </SimpleCard>
      )}

      <SimpleSwitchSettingsItem
        item={item('mqttOutput', t('output'), t('output_hint'), v.enabled && v.output?.enabled)}
        textColor={textColor}
        isDisabled={!v.enabled}
        handleSwitch={(e) => setOutput({ enabled: e.target.checked })}
      />

      {v.enabled && v.output?.enabled && (
        <>
          <SimpleSwitchSettingsItem
            item={item('mqttControl', t('output_control'), t('output_control_hint'), v.output?.control)}
            textColor={textColor}
            handleSwitch={(e) => setOutput({ control: e.target.checked })}
          />

          <SimpleCard title={t('exports')} textColor={textColor}>
            <Flex wrap="wrap" gap="16px">
              {domains.map((d) => (
                <FormControl key={d} w="auto" display="flex" alignItems="center" gap="8px">
                  <Switch isChecked={exports[d] ?? d !== 'mcu'} onChange={(e) => setExport(d, e.target.checked)} colorScheme="green" size="sm" />
                  <FormLabel mb="0" fontSize="sm" color={subTextColor}>{t(`export_${d}`)}</FormLabel>
                </FormControl>
              ))}
            </Flex>
            {deviceId && (
              <Text fontSize="xs" color={subTextColor} mt="10px">
                {intl.formatMessage({ id: 'automation.mqtt.output_device' }, { id: <b>{deviceId}</b> })}
              </Text>
            )}
          </SimpleCard>
        </>
      )}
    </PanelCard>
  );
};

export default MqttSettingsCard;
