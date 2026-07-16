import {
  Badge,
  Flex,
  Icon,
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
import { RULE_TEMPLATES } from './ruleTemplates';

/**
 * A gallery of starter rules. Picking one opens the normal editor pre-filled, so
 * the user still sets thresholds and it still goes through validation.
 */
const RuleTemplatesModal = ({ isOpen, onClose, onPick, locationSet }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const cardBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');
  const cardHover = useColorModeValue('secondaryGray.100', 'whiteAlpha.200');

  const pick = (t) => {
    onPick({ ...t.rule, name: intl.formatMessage({ id: `automation.templates.${t.id}.name` }) });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{intl.formatMessage({ id: 'automation.templates.title' })}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" color={subTextColor} mb="14px">
            {intl.formatMessage({ id: 'automation.templates.subtitle' })}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
            {RULE_TEMPLATES.map((t) => {
              const needsLocation = t.requiresLocation && !locationSet;
              return (
                <Flex
                  key={t.id}
                  as="button"
                  textAlign="left"
                  direction="column"
                  gap="6px"
                  bg={cardBg}
                  _hover={{ bg: cardHover }}
                  borderRadius="12px"
                  p="14px"
                  onClick={() => pick(t)}
                >
                  <Flex align="center" gap="8px">
                    <Icon as={t.icon} boxSize="20px" color="brand.400" />
                    <Text fontSize="sm" fontWeight="700" color={textColor}>
                      {intl.formatMessage({ id: `automation.templates.${t.id}.name` })}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color={subTextColor}>
                    {intl.formatMessage({ id: `automation.templates.${t.id}.desc` })}
                  </Text>
                  <Flex gap="6px" wrap="wrap" mt="2px">
                    {t.rule.isSafety && (
                      <Badge colorScheme="red" fontSize="0.6rem">
                        {intl.formatMessage({ id: 'automation.rules.safety' })}
                      </Badge>
                    )}
                    {t.rule.conditions.length > 1 && (
                      <Badge colorScheme="purple" fontSize="0.6rem">
                        {intl.formatMessage({ id: 'automation.templates.multi' })}
                      </Badge>
                    )}
                    {t.requiresLocation && (
                      <Badge colorScheme={needsLocation ? 'orange' : 'gray'} fontSize="0.6rem">
                        {intl.formatMessage({ id: 'automation.templates.requires_location' })}
                      </Badge>
                    )}
                  </Flex>
                </Flex>
              );
            })}
          </SimpleGrid>
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

export default RuleTemplatesModal;
