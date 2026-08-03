import { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Checkbox,
  Flex,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';

// The passphrase is asked for HERE, not inline in the list row.
//
// The panel this replaces kept the field inside the row and tracked which row
// was open by its ARRAY INDEX. Signal strength changes constantly, so a rescan
// reordered the list and moved the open field onto a different network: you
// could type the password for one and send it to another. A dialog is bound to
// the network it was opened for, and nothing that arrives later can move it.
const WifiPasswordModal = ({ isOpen, network, onClose, onSubmit, isConnecting, error }) => {
  const intl = useIntl();
  // Explicit, not inherited: with the theme's defaults the typed characters came
  // out invisible in dark mode — a password field you cannot read as you type.
  const inputBg = useColorModeValue('white', 'whiteAlpha.100');
  const inputColor = useColorModeValue('gray.900', 'white');
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.300');
  const [passphrase, setPassphrase] = useState('');
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualSsid, setManualSsid] = useState('');
  // Told apart from the `error` prop, which carries what the backend said: this
  // one is about the form, and must clear as soon as the dialog is reused.
  const [formError, setFormError] = useState(null);

  // A fresh dialog per network: a passphrase left over from a previous attempt
  // must never be submitted to a different one.
  useEffect(() => {
    if (isOpen) {
      setPassphrase('');
      setShow(false);
      setHidden(!!network?.hidden);
      setManualSsid('');
      setFormError(null);
    }
  }, [isOpen, network]);

  if (!network) return null;

  const isHiddenEntry = network.manual;
  const ssid = isHiddenEntry ? manualSsid : network.ssid;
  // A network the list reported as secured needs one. The hidden-network entry
  // is typed blind — it may well be open — so there it stays optional.
  const requiresPassphrase = !isHiddenEntry && !network.open;

  const submit = (e) => {
    e?.preventDefault?.();
    if (isHiddenEntry && !manualSsid.trim()) return;
    // An empty field used to be sent as no passphrase at all, and nmcli's
    // "Secrets were required, but not provided" came back to the user as "Wrong
    // password" — for a password they never typed.
    if (requiresPassphrase && !passphrase) {
      setFormError(intl.formatMessage({ id: 'wifi.password.required' }));
      return;
    }
    onSubmit({ ssid: ssid.trim(), passphrase: passphrase || null, hidden });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>
          {intl.formatMessage(
            { id: 'wifi.password.title' },
            {
              ssid:
                (isHiddenEntry ? manualSsid : ssid) ||
                intl.formatMessage({ id: 'wifi.network.hidden' }),
            }
          )}
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" gap={3}>
            {/* A hidden network does not announce its name, so it has to be
                typed — there is nothing in the list to click. */}
            {isHiddenEntry && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">
                  {intl.formatMessage({ id: 'wifi.password.ssidLabel' })}
                </FormLabel>
                <Input
                  autoFocus
                  value={manualSsid}
                  onChange={(e) => setManualSsid(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'wifi.password.ssidPlaceholder' })}
                  bg={inputBg}
                  color={inputColor}
                  borderColor={inputBorder}
                />
              </FormControl>
            )}
            {network.saved && (
              <Text fontSize="sm" color="gray.500">
                {intl.formatMessage({ id: 'wifi.password.replacing' })}
              </Text>
            )}
            <FormControl isInvalid={!!formError}>
              <FormLabel fontSize="sm">
                {intl.formatMessage({ id: 'wifi.password.label' })}
              </FormLabel>
              <InputGroup size="md">
                <Input
                  autoFocus={!isHiddenEntry}
                  type={show ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => {
                    setPassphrase(e.target.value);
                    setFormError(null);
                  }}
                  placeholder={intl.formatMessage({ id: 'wifi.password.placeholder' })}
                  bg={inputBg}
                  color={inputColor}
                  borderColor={inputBorder}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                    {intl.formatMessage({
                      id: show ? 'wifi.password.hide' : 'wifi.password.show',
                    })}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {isHiddenEntry && (
              <Checkbox
                isChecked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                size="sm"
              >
                {intl.formatMessage({ id: 'wifi.password.isHidden' })}
              </Checkbox>
            )}

            {(formError || error) && (
              <Text color="red.400" fontSize="sm">
                {formError || error}
              </Text>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isConnecting}>
            {intl.formatMessage({ id: 'wifi.action.cancel' })}
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isConnecting}
            loadingText={intl.formatMessage({ id: 'wifi.status.connecting' })}
          >
            {intl.formatMessage({ id: 'wifi.action.connect' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WifiPasswordModal;
