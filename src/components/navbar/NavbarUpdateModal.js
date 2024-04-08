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
} from '@chakra-ui/react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { MCU_UPDATE_PROGRESS_QUERY, MCU_UPDATE_QUERY } from '../../graphql/mcu';
import { useEffect, useState } from 'react';
import { updateMinerAction } from '../../redux/actions/minerAction';
import { MCU_REBOOT_QUERY } from '../../graphql/mcu';
import { useDispatch } from 'react-redux';

const NavbarUpdateModal = ({
  isOpen,
  onClose,
  localVersion,
  remoteVersion,
}) => {
  const dispatch = useDispatch();
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [handleUpdate, { error: errorUpdate, data: dataUpdate }] = useLazyQuery(
    MCU_UPDATE_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const {
    data: dataProgress,
    startPolling: startPollingProgress,
    stopPolling: stopPollingProgress,
  } = useQuery(MCU_UPDATE_PROGRESS_QUERY);

  const startUpdate = () => {
    handleUpdate();
    setUpdateInProgress(true);
    startPollingProgress(3000);
  };

  const { value: remoteProgress } =
    dataProgress?.Mcu?.updateProgress?.result || {};

  useEffect(() => {
    if (updateInProgress) {
      setProgress(remoteProgress);
    }

    if (remoteProgress === 100) {
      stopPollingProgress();
      setUpdateInProgress(false);
      setProgress(0);
      setDone(true);
    }
  }, [updateInProgress, remoteProgress, stopPollingProgress]);

  const [rebootMcu, { loading: loadingRebootMcu, error: errorRebootMcu }] =
    useLazyQuery(MCU_REBOOT_QUERY, { fetchPolicy: 'no-cache' });

  const handleReloadApp = () => {
    dispatch(
      updateMinerAction({
        loading: loadingRebootMcu,
        error: errorRebootMcu,
        data: rebootMcu,
        status: false,
        timestamp: Date.now(),
      })
    );
    /*
    return () => {
      window.location.reload();
    };
    */
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'sm', md: '4xl' }}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      onCloseComplete={() => {
        setDone(false);
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
              : 'Please update to the latest version of the app to get the latest features and bug fixes. Note: your system will be rebooted after update is completed.'}
          </Text>
          {updateInProgress && <Text>Updating... {progress}%</Text>}
          {done && !updateInProgress && <Text>Done!</Text>}
        </ModalBody>
        {!done && !updateInProgress && <ModalCloseButton />}
        <ModalFooter>
          {localVersion !== remoteVersion && !done && (
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
              Reboot system
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NavbarUpdateModal;
