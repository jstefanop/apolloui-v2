import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
} from '@chakra-ui/react';
import { NODE_FORMAT_PROGRESS_QUERY } from '../../graphql/node';
import { useQuery } from '@apollo/client';

const ModalFormat = ({ isOpen, onClose, onFormat }) => {
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const {
    data: dataProgress,
    startPolling: startPollingProgress,
    stopPolling: stopPollingProgress,
  } = useQuery(NODE_FORMAT_PROGRESS_QUERY);

  const startFormat = () => {
    onFormat();
    setUpdateInProgress(true);
    startPollingProgress(3000);
  };

  const { value: remoteProgress } =
    dataProgress?.Node?.formatProgress?.result || {};

  useEffect(() => {
    if (updateInProgress) {
      setProgress(remoteProgress);
    }

    if (remoteProgress >= 90 || !isOpen) {
      stopPollingProgress();
      setUpdateInProgress(false);
      setProgress(0);
      setDone(true);
    }
  }, [updateInProgress, remoteProgress, isOpen, stopPollingProgress]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Format Node SSD disk</ModalHeader>
        <ModalBody>
          <Flex>
            <Text>
              Are you sure you want format your SSD disk? You will lose all your
              data.
            </Text>
          </Flex>
          {updateInProgress && (
            <Flex>
              <Text>Formatting in progress... {progress}% complete</Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={updateInProgress}
          >
            Close
          </Button>
          <Button
            colorScheme="red"
            onClick={startFormat}
            isDisabled={updateInProgress}
            isLoading={updateInProgress}
          >
            YES, Format it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalFormat;
