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
} from '@chakra-ui/react';
const ModalConnectNode = ({ isOpen, onClose, pass, address }) => {
  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect to your Bitcoin Node</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={'5'}>
            Use following data to connect to your Bitcoin node:
          </Text>
          <Flex>
            <VStack spacing={2} align="stretch">
              <Code>Address: {address}</Code>
              <Code>Username: futurebit</Code>
              <Code>Password: {pass}</Code>
            </VStack>
          </Flex>
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
