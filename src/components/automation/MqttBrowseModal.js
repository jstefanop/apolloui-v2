import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLazyQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import { DISCOVER_AUTOMATION_MQTT_QUERY } from '../../graphql/automation';

// A short segment name for a topic, sanitized for use as a signal name.
const nameFromTopic = (topic) =>
  (topic.split('/').filter(Boolean).pop() || 'input').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24);

/**
 * Browse the broker: scan for topics (wildcard subscription for a few seconds),
 * then pick one — or a numeric field inside a JSON payload — to add as an input.
 */
const MqttBrowseModal = ({ isOpen, onClose, brokerInput, onPick }) => {
  const intl = useIntl();
  const rowBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  const [prefix, setPrefix] = useState('');
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState(null);
  const [discover, { loading }] = useLazyQuery(DISCOVER_AUTOMATION_MQTT_QUERY, { fetchPolicy: 'no-cache' });

  const scan = async () => {
    setError(null);
    setTopics(null);
    const { data } = await discover({ variables: { input: brokerInput(), prefix: prefix || null, seconds: 5 } });
    const r = data?.Automation?.discoverMqtt;
    if (r?.error) return setError(r.error.message);
    if (!r?.result?.ok) return setError(r?.result?.error || intl.formatMessage({ id: 'automation.mqtt.browse_failed' }));
    setTopics(r.result.topics);
  };

  const pick = (topic, jsonPath) => {
    onPick({ name: nameFromTopic(topic) + (jsonPath ? `_${jsonPath.split('.').pop()}` : ''), topic, jsonPath: jsonPath || '', unit: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{intl.formatMessage({ id: 'automation.mqtt.browse_title' })}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap="8px" mb="12px">
            <Input
              variant="auth"
              size="sm"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder={intl.formatMessage({ id: 'automation.mqtt.browse_prefix' })}
            />
            <Button size="sm" variant="brand" onClick={scan} isLoading={loading} minW="120px">
              {intl.formatMessage({ id: 'automation.mqtt.browse_scan' })}
            </Button>
          </Flex>

          {loading && (
            <Flex align="center" gap="10px" py="20px" justify="center">
              <Spinner size="sm" />
              <Text fontSize="sm" color={subTextColor}>
                {intl.formatMessage({ id: 'automation.mqtt.browse_scanning' })}
              </Text>
            </Flex>
          )}

          {error && (
            <Text fontSize="sm" color="red.400">
              {error}
            </Text>
          )}

          {topics && !topics.length && (
            <Text fontSize="sm" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.mqtt.browse_none' })}
            </Text>
          )}

          <Flex direction="column" gap="8px">
            {(topics || []).map((t) => (
              <Box key={t.topic} bg={rowBg} borderRadius="10px" p="10px 12px">
                <Flex justify="space-between" align="center" gap="10px" wrap="wrap">
                  <Box minW="0" flex="1">
                    <Text fontSize="sm" fontWeight="600" wordBreak="break-all">
                      {t.topic}
                    </Text>
                    {t.sample && (
                      <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                        {t.sample}
                      </Text>
                    )}
                  </Box>
                  {/* A plain (non-JSON) payload maps the topic directly. */}
                  {(!t.jsonPaths || !t.jsonPaths.length) && (
                    <Button size="xs" variant="light" onClick={() => pick(t.topic)}>
                      {intl.formatMessage({ id: 'automation.mqtt.browse_use' })}
                    </Button>
                  )}
                </Flex>

                {/* JSON payload: offer the numeric fields as clickable paths. */}
                {t.jsonPaths && t.jsonPaths.length > 0 && (
                  <Flex gap="6px" mt="8px" wrap="wrap">
                    {t.jsonPaths.map((p) => (
                      <Badge
                        key={p}
                        as="button"
                        colorScheme="pink"
                        px="8px"
                        py="3px"
                        borderRadius="6px"
                        onClick={() => pick(t.topic, p)}
                      >
                        {p}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Box>
            ))}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            {intl.formatMessage({ id: 'automation.editor.cancel' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MqttBrowseModal;
