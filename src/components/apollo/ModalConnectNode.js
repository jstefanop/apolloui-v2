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
  VStack,
  Code,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { NODE_CONNECTION_INFO_QUERY } from '../../graphql/node';

const ModalConnectNode = ({ isOpen, onClose, address }) => {
  const { data, loading, error: queryError } = useQuery(
    NODE_CONNECTION_INFO_QUERY,
    {
      skip: !isOpen,
      fetchPolicy: 'no-cache',
    }
  );
  const response = data?.Node?.connectionInfo;
  const credentials = response?.result;
  const error = queryError?.message || response?.error?.message;

  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect to your Bitcoin Node</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={'5'}>Use the following data to connect to your Bitcoin node:</Text>
          {loading && <Spinner />}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {credentials && (
            <Flex>
              <VStack spacing={2} align="stretch">
                <Code>Address: {address}</Code>
                <Code>Username: {credentials.username}</Code>
                <Code>Password: {credentials.password}</Code>
              </VStack>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalConnectNode;
