// Chakra Imports
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Text,
  Button,
  ModalBody,
  Progress,
  Flex,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { MCU_UPDATE_PROGRESS_QUERY, MCU_UPDATE_MUTATION } from '../../graphql/mcu';
import { useEffect, useState } from 'react';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { useIntl } from 'react-intl';

const NavbarUpdateModal = ({
  isOpen,
  onClose,
  localVersion,
  remoteVersion,
  versionCheckSucceeded,
  updateAvailable,
}) => {
  const intl = useIntl();
  const [done, setDone] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  // Mutation — onError noop so the fire-and-forget call cannot reject
  // unhandled; the effect below reads the error from the hook state instead.
  const [handleUpdate, { error: errorUpdate }] = useMutation(MCU_UPDATE_MUTATION, {
    onError: () => {},
  });

  // An update outlives the page that started it — it runs on the device and ends
  // in a reboot. Read whether one is under way from there, so reopening this
  // dialog (or landing on it after a refresh) shows the update still going
  // instead of offering to start a second one.
  const {
    progress,
    isRunning: updateInProgress,
    outcome,
    acknowledgeOutcome,
    markSubmitted,
  } = useTaskProgress(
    MCU_UPDATE_PROGRESS_QUERY,
    (data) => data?.Mcu?.updateProgress?.result?.value
  );

  const startUpdate = () => {
    setUpdateError(null);
    // Latch before the next poll can answer: this starts a system update, and
    // two of them running at once would fight over the same build directory.
    markSubmitted();
    handleUpdate();
  };

  useEffect(() => {
    if (errorUpdate) {
      setUpdateError(
        errorUpdate.message ||
          intl.formatMessage({ id: 'update.error.start_failed' })
      );
    }
  }, [errorUpdate, intl]);

  useEffect(() => {
    if (!outcome) return;
    acknowledgeOutcome();
    if (outcome.status === 'success') {
      setDone(true);
      return;
    }
    // The update stopped without reaching the end: say so rather than offering
    // the reload button as if it had worked.
    setUpdateError(intl.formatMessage({ id: 'update.error.stopped' }));
  }, [outcome, acknowledgeOutcome, intl]);

  const handleReloadApp = () => {
    return () => {
      window.location.reload();
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      // Always closable. The update runs on the device and this dialog only
      // watches it, so refusing to close achieves nothing except trapping the
      // whole UI behind the overlay if a progress file is ever left behind.
      onClose={onClose}
      size={{ base: 'sm', md: '4xl' }}
      closeOnOverlayClick={false}
      onCloseComplete={() => {
        setDone(false);
        setUpdateError(null);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {!versionCheckSucceeded
            ? intl.formatMessage({ id: 'update.title.check_failed' })
            : updateAvailable
            ? intl.formatMessage(
                { id: 'update.title.available' },
                { version: remoteVersion }
              )
            : intl.formatMessage(
                { id: 'update.title.current' },
                { version: localVersion }
              )}
        </ModalHeader>
        <ModalBody>
          <Text>
            {!versionCheckSucceeded
              ? intl.formatMessage({ id: 'update.description.check_failed' })
              : updateAvailable
              ? intl.formatMessage({ id: 'update.description.available' })
              : intl.formatMessage({ id: 'update.description.current' })}
          </Text>
          {updateInProgress && (
            <Flex direction="column" gap={2} mt={4}>
              <Progress
                value={progress}
                size="md"
                borderRadius="md"
                colorScheme="blue"
                hasStripe
                isAnimated
              />
              <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
                {intl.formatMessage(
                  { id: 'update.status.updating' },
                  { progress }
                )}
              </Text>
            </Flex>
          )}
          {done && !updateInProgress && (
            <Text>{intl.formatMessage({ id: 'update.status.done' })}</Text>
          )}
          {updateError && (
            <Text color="red.500" mt={2}>
              {intl.formatMessage(
                { id: 'update.status.error' },
                { error: updateError }
              )}
            </Text>
          )}
        </ModalBody>
        {!done && <ModalCloseButton />}
        <ModalFooter>
          {updateAvailable && !done && !updateError && (
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => startUpdate()}
              isDisabled={updateInProgress}
              isLoading={updateInProgress}
            >
              {intl.formatMessage({ id: 'update.button.update' })}
            </Button>
          )}
          {!done && (
            <Button variant="ghost" onClick={onClose}>
              {updateInProgress
                ? intl.formatMessage({ id: 'update.button.hide' })
                : updateAvailable
                ? intl.formatMessage({ id: 'update.button.cancel' })
                : intl.formatMessage({ id: 'update.button.close' })}
            </Button>
          )}
          {done && (
            <Button colorScheme="orange" onClick={handleReloadApp()}>
              {intl.formatMessage({ id: 'update.button.reload' })}
            </Button>
          )}
          {updateError && (
            <Button colorScheme="red" onClick={() => setUpdateError(null)}>
              {intl.formatMessage({ id: 'update.button.retry' })}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NavbarUpdateModal;
