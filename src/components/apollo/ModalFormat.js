import { useEffect } from 'react';
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
import { NODE_FORMAT_PROGRESS_QUERY } from '../../graphql/node';
import { sendFeedback } from '../../redux/slices/feedbackSlice';
import { useDispatch } from 'react-redux';
import { useTaskProgress } from '../../hooks/useTaskProgress';

const ModalFormat = ({ isOpen, onClose, onFormat }) => {
  const dispatch = useDispatch();

  // Whether a format is running comes from the device, not from having clicked
  // the button: reload the page mid-format and this still reports it, where the
  // local flag used to show an idle dialog over a disk being wiped.
  const { progress, isRunning, outcome, acknowledgeOutcome, markSubmitted } =
    useTaskProgress(
      NODE_FORMAT_PROGRESS_QUERY,
      (data) => data?.Node?.formatProgress?.result?.value
    );

  const startFormat = () => {
    // Latch immediately: the next poll is seconds away, and this button wipes a
    // disk — long enough to press twice and run two of them at once.
    markSubmitted();
    onFormat();
  };

  useEffect(() => {
    if (!outcome) return;
    acknowledgeOutcome();
    if (outcome.status === 'success') {
      onClose();
      dispatch(
        sendFeedback({
          message: 'Format done! Your system is ready.',
          type: 'success',
        })
      );
      return;
    }
    // A format that gave up leaves the dialog open: the disk is not ready, and
    // saying "done" over it is how someone ends up with an unusable node. Which
    // message matters — telling someone their disk is intact when it has already
    // been wiped is how they decide no recovery is needed.
    dispatch(
      sendFeedback({
        message:
          outcome.code === -2
            ? 'Format failed after the disk was erased. The node cannot start until a format completes — check the logs and retry.'
            : 'Format failed. The disk was not changed — check the logs before retrying.',
        type: 'error',
      })
    );
  }, [outcome, acknowledgeOutcome, onClose, dispatch]);

  return (
    <Modal
      closeOnOverlayClick={false}
      // Always dismissible. The format runs on the device, so this dialog is a
      // view of it, not the thing itself — and it reopens by itself while one is
      // under way. A dialog that cannot be closed traps the whole UI if the
      // progress file is ever left behind.
      isOpen={isOpen}
      onClose={onClose}
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
          <Button variant="ghost" mr={3} onClick={onClose}>
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
