import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  Button,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';

// Leaving a network is not undoable from the page that asks for it.
//
// The panel this replaces disconnected on a single click, and its "disconnect"
// deleted every saved profile it could match. Worse, on a device administered
// over that very radio the click cut off the connection carrying the page — with
// no way back except physical access. So: name the network, and say plainly when
// this is the link you are here through.
const WifiConfirmDialog = ({ request, onClose }) => {
  const intl = useIntl();
  const cancelRef = useRef();
  const [running, setRunning] = useState(false);

  if (!request) return null;

  const { kind, ssid, selfLockout, run } = request;

  const confirm = async () => {
    setRunning(true);
    try {
      await run();
    } finally {
      setRunning(false);
      onClose();
    }
  };

  return (
    <AlertDialog
      isOpen
      leastDestructiveRef={cancelRef}
      onClose={running ? () => {} : onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {intl.formatMessage({ id: `wifi.confirm.${kind}.title` }, { ssid })}
          </AlertDialogHeader>
          <AlertDialogBody>
            <Flex direction="column" gap={3}>
              <Text>
                {intl.formatMessage({ id: `wifi.confirm.${kind}.body` }, { ssid })}
              </Text>
              {selfLockout && (
                <Alert status="warning" borderRadius="8px" fontSize="sm">
                  <AlertIcon />
                  {intl.formatMessage({ id: 'wifi.confirm.selfLockout' })}
                </Alert>
              )}
            </Flex>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={running}>
              {intl.formatMessage({ id: 'wifi.action.cancel' })}
            </Button>
            <Button colorScheme="red" ml={3} onClick={confirm} isLoading={running}>
              {intl.formatMessage({ id: `wifi.action.${kind}` })}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default WifiConfirmDialog;
