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
const ModalFormat = ({ isOpen, onClose, onFormat }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Format Node SSD disk</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex>
            <Text>
              Are you sure you want format your SSD disk? You will lose all your
              data.
            </Text>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="red" onClick={onFormat}>YES, Format it</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalFormat;
