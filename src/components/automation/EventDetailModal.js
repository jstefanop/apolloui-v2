import {
  Badge,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import moment from 'moment';

/**
 * The full record behind a history entry: what the engine decided, whether it
 * acted or was blocked, and every signal value at that moment (stale ones too).
 */
const EventDetailModal = ({ event, onClose }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  if (!event) return null;

  const yesNo = (v) => intl.formatMessage({ id: v ? 'automation.editor.yes' : 'automation.editor.no' });

  const badge = event.blockedBy
    ? { colorScheme: 'orange', label: event.blockedBy }
    : event.applied
    ? { colorScheme: 'green', label: event.changeType }
    : event.dryRun
    ? { colorScheme: 'blue', label: intl.formatMessage({ id: 'automation.events.dry_run' }) }
    : { colorScheme: 'gray', label: event.decision };

  const field = (labelId, value) =>
    value === null || value === undefined || value === '' ? null : (
      <Flex justify="space-between" gap="12px" py="4px">
        <Text fontSize="sm" color={subTextColor}>
          {intl.formatMessage({ id: labelId })}
        </Text>
        <Text fontSize="sm" color={textColor} fontWeight="600" textAlign="right">
          {value}
        </Text>
      </Flex>
    );

  return (
    <Modal isOpen={!!event} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap="10px" wrap="wrap">
            <Text>{intl.formatMessage({ id: 'automation.events.detail.title' })}</Text>
            <Badge colorScheme={badge.colorScheme}>{badge.label}</Badge>
          </Flex>
          <Text fontSize="sm" color={subTextColor} fontWeight="400" mt="2px">
            {moment(event.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            {field('automation.events.detail.rule', event.ruleName)}
            {field('automation.events.detail.decision', event.decision)}
            {field('automation.events.detail.change_type', event.changeType)}
            {field('automation.events.detail.applied', yesNo(event.applied))}
            {field('automation.events.detail.dry_run', yesNo(event.dryRun))}
            {field('automation.events.detail.blocked_by', event.blockedBy)}
          </Flex>

          {event.message && (
            <Flex bg={rowBg} borderRadius="10px" p="10px 12px" mt="10px">
              <Text fontSize="sm" color={textColor}>
                {event.message}
              </Text>
            </Flex>
          )}

          {event.signals?.length > 0 && (
            <>
              <Text fontSize="sm" fontWeight="700" color={textColor} mt="16px" mb="8px">
                {intl.formatMessage({ id: 'automation.events.detail.signals' })}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="6px">
                {event.signals.map((s) => (
                  <Flex key={s.id} justify="space-between" gap="8px" bg={rowBg} borderRadius="8px" p="6px 10px">
                    <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                      {s.id}
                    </Text>
                    <Text fontSize="xs" color={s.stale ? subTextColor : textColor} fontWeight="600">
                      {s.stale ? intl.formatMessage({ id: 'automation.events.detail.stale' }) : s.value}
                    </Text>
                  </Flex>
                ))}
              </SimpleGrid>
            </>
          )}
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

export default EventDetailModal;
