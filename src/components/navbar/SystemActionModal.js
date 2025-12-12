import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  Spinner,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { useIntl, FormattedMessage } from 'react-intl';

const REBOOT_DURATION = (process.env.NODE_ENV === 'development') ? 5 : 60; // seconds
const SHUTDOWN_DURATION = (process.env.NODE_ENV === 'development') ? 5 : 45; // seconds

const SystemActionModal = ({
  isOpen,
  onClose,
  actionType, // 'reboot' | 'shutdown'
  onConfirm,
}) => {
  const intl = useIntl();
  const [phase, setPhase] = useState('confirm'); // 'confirm' | 'loading' | 'complete'
  const [countdown, setCountdown] = useState(0);

  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)');

  const isReboot = actionType === 'reboot';
  const duration = isReboot ? REBOOT_DURATION : SHUTDOWN_DURATION;

  // Reset state when modal opens/closes or actionType changes
  useEffect(() => {
    if (isOpen) {
      setPhase('confirm');
      setCountdown(0);
    }
  }, [isOpen, actionType]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (phase === 'loading' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (isReboot) {
              // For reboot, close modal and reload page
              onClose();
              window.location.reload();
            } else {
              // For shutdown, show complete phase
              setPhase('complete');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, countdown, isReboot, onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    setCountdown(duration);
    setPhase('loading');
  }, [onConfirm, duration]);

  const handleClose = useCallback(() => {
    if (phase === 'confirm') {
      onClose();
    }
  }, [phase, onClose]);

  const getTitle = () => {
    if (phase === 'confirm') {
      return intl.formatMessage({
        id: isReboot ? 'system_action.reboot.confirm_title' : 'system_action.shutdown.confirm_title',
      });
    }
    if (phase === 'loading') {
      return intl.formatMessage({
        id: isReboot ? 'system_action.reboot.loading_title' : 'system_action.shutdown.loading_title',
      });
    }
    return intl.formatMessage({ id: 'system_action.shutdown.complete_title' });
  };

  const getDescription = () => {
    if (phase === 'confirm') {
      return intl.formatMessage({
        id: isReboot ? 'system_action.reboot.confirm_description' : 'system_action.shutdown.confirm_description',
      });
    }
    if (phase === 'loading') {
      return intl.formatMessage(
        { id: isReboot ? 'system_action.reboot.loading_description' : 'system_action.shutdown.loading_description' },
        { seconds: countdown }
      );
    }
    return intl.formatMessage({ id: 'system_action.shutdown.complete_description' });
  };

  // Full screen overlay for loading and complete phases
  if (phase === 'loading' || phase === 'complete') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        size="full"
        motionPreset="none"
      >
        <ModalOverlay bg={overlayBg} />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          m={0}
          maxW="100vw"
          h="100vh"
        >
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="100%"
            color="white"
            textAlign="center"
            px={4}
          >
            {phase === 'loading' ? (
              <>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.600"
                  color="brand.500"
                  size="xl"
                  mb={6}
                />
                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                  {getTitle()}
                </Text>
                <Text fontSize="lg" color="gray.300" mb={4}>
                  {getDescription()}
                </Text>
                <Box
                  w="200px"
                  h="4px"
                  bg="gray.700"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    bg="brand.500"
                    borderRadius="full"
                    transition="width 1s linear"
                    w={`${((duration - countdown) / duration) * 100}%`}
                  />
                </Box>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  {countdown}s
                </Text>
              </>
            ) : (
              <>
                <Icon as={CheckIcon} w={16} h={16} color="orange.400" mb={6} />
                <Text fontSize="3xl" fontWeight="bold" mb={4}>
                  {getTitle()}
                </Text>
                <Text fontSize="lg" color="gray.300">
                  {getDescription()}
                </Text>
              </>
            )}
          </Flex>
        </ModalContent>
      </Modal>
    );
  }

  // Confirmation modal
  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          <Flex align="center">
            <Icon as={WarningIcon} color="orange.400" mr={2} />
            {getTitle()}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text color={textColor}>{getDescription()}</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            <FormattedMessage id="system_action.cancel" />
          </Button>
          <Button
            colorScheme={isReboot ? 'orange' : 'red'}
            onClick={handleConfirm}
          >
            <FormattedMessage
              id={isReboot ? 'system_action.reboot.button' : 'system_action.shutdown.button'}
            />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SystemActionModal;
