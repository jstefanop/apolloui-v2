import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Flex,
  Progress,
  Text,
} from '@chakra-ui/react';
import { useFormatTask } from '../../contexts/FormatTaskContext';

// A view onto the format task owned by FormatTaskContext. Rendered once at layout
// level (not per-page), so it survives navigation; the outcome toast and progress
// tracking live in the context, this only renders the current state and forwards
// the two actions.
const ModalFormat = () => {
  const { progress, isRunning, isModalOpen, closeModal, startFormat } =
    useFormatTask();

  return (
    <Modal
      closeOnOverlayClick={false}
      // Always dismissible. The format runs on the device, so this dialog is a
      // view of it, not the thing itself — and the navbar keeps a live indicator
      // while one is under way. A dialog that cannot be closed traps the whole UI
      // if the progress file is ever left behind.
      isOpen={isModalOpen}
      onClose={closeModal}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Format Node SSD disk</ModalHeader>
        <ModalBody>
          {isRunning ? (
            <Flex direction="column" gap={3}>
              <Text>
                Formatting the disk. This takes a few minutes — the node restarts
                on its own when it is done.
              </Text>
              <Progress
                value={progress}
                size="md"
                borderRadius="md"
                colorScheme="purple"
                hasStripe
                isAnimated
              />
              <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
                {progress}%
              </Text>
            </Flex>
          ) : (
            <Flex>
              <Text>
                Are you sure you want format your SSD disk? You will lose all your
                data.
              </Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Never disabled: closing hides the dialog, it does not stop the
              format, and being unable to dismiss it traps the whole UI. */}
          <Button variant="ghost" mr={3} onClick={closeModal}>
            {isRunning ? 'Hide' : 'Close'}
          </Button>
          <Button
            colorScheme="red"
            onClick={startFormat}
            isDisabled={isRunning}
            isLoading={isRunning}
            loadingText="Formatting"
          >
            YES, Format it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalFormat;
