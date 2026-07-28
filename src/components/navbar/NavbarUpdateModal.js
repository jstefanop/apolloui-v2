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
import { useLazyQuery } from '@apollo/client';
import { MCU_UPDATE_PROGRESS_QUERY, MCU_UPDATE_QUERY } from '../../graphql/mcu';
import { useEffect, useState } from 'react';
import { useTaskProgress } from '../../hooks/useTaskProgress';

const NavbarUpdateModal = ({
  isOpen,
  onClose,
  localVersion,
  remoteVersion,
}) => {
  const [done, setDone] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [handleUpdate, { error: errorUpdate }] = useLazyQuery(MCU_UPDATE_QUERY, {
    fetchPolicy: 'no-cache',
  });

  // An update outlives the page that started it — it runs on the device and ends
  // in a reboot. Read whether one is under way from there, so reopening this
  // dialog (or landing on it after a refresh) shows the update still going
  // instead of offering to start a second one.
  const {
    progress,
    isRunning: updateInProgress,
    justFinished,
    acknowledgeFinish,
  } = useTaskProgress(
    MCU_UPDATE_PROGRESS_QUERY,
    (data) => data?.Mcu?.updateProgress?.result?.value
  );

  const startUpdate = () => {
    setUpdateError(null);
    handleUpdate();
  };

  useEffect(() => {
    if (errorUpdate) {
      setUpdateError(
        errorUpdate.message || 'An error occurred during the update process'
      );
    }
  }, [errorUpdate]);

  useEffect(() => {
    if (!justFinished) return;
    acknowledgeFinish();
    setDone(true);
  }, [justFinished, acknowledgeFinish]);

  const handleReloadApp = () => {
    return () => {
      window.location.reload();
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (updateInProgress) {
          // Show warning that update is in progress
          return;
        }
        onClose();
      }}
      size={{ base: 'sm', md: '4xl' }}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      onCloseComplete={() => {
        setDone(false);
        setUpdateError(null);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {localVersion === remoteVersion
            ? `Your app is updated to the latest version v${localVersion}`
            : `New version v${remoteVersion} is available!`}
        </ModalHeader>
        <ModalBody>
          <Text>
            {localVersion === remoteVersion
              ? 'You are using the latest version of the app.'
              : 'Please update to the latest version of the app to get the latest features and bug fixes. Update can take 15-30 min. Note: your system will restart after update is complete. Do NOT power off the system until it has restarted. Close this page or refresh it after your system has restarted'}
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
                Updating… {progress}%
              </Text>
            </Flex>
          )}
          {done && !updateInProgress && <Text>Done!</Text>}
          {updateError && (
            <Text color="red.500" mt={2}>
              Error: {updateError}
            </Text>
          )}
        </ModalBody>
        {!done && !updateInProgress && <ModalCloseButton />}
        <ModalFooter>
          {localVersion !== remoteVersion && !done && !updateError && (
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => startUpdate()}
              isDisabled={updateInProgress}
              isLoading={updateInProgress}
            >
              Update
            </Button>
          )}
          {!done && !updateInProgress && (
            <Button variant="ghost" onClick={onClose}>
              {localVersion === remoteVersion ? 'Close' : 'Cancel'}
            </Button>
          )}
          {done && (
            <Button colorScheme="orange" onClick={handleReloadApp()}>
              Reload App
            </Button>
          )}
          {updateError && (
            <Button colorScheme="red" onClick={() => setUpdateError(null)}>
              Try Again
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NavbarUpdateModal;
