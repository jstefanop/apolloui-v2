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
  const { progress, isRunning, justFinished, acknowledgeFinish } = useTaskProgress(
    NODE_FORMAT_PROGRESS_QUERY,
    (data) => data?.Node?.formatProgress?.result?.value
  );

  useEffect(() => {
    if (!justFinished) return;
    acknowledgeFinish();
    onClose();
    dispatch(
      sendFeedback({
        message: 'Format done! Your system is ready.',
        type: 'success',
      })
    );
  }, [justFinished, acknowledgeFinish, onClose, dispatch]);

  return (
    <Modal
      closeOnOverlayClick={false}
      // Dismissing mid-format would leave the disk being wiped with nothing on
      // screen to say so.
      closeOnEsc={!isRunning}
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
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isRunning}>
            Close
          </Button>
          <Button
            colorScheme="red"
            onClick={onFormat}
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
