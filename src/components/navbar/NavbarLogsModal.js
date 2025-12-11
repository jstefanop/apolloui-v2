import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import LogsViewer from '../logs/LogsViewer';

const NavbarLogsModal = ({ isOpen, onClose }) => {
  const modalBgColor = useColorModeValue('gray.300', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="80vh" bg={modalBgColor}>
        <ModalHeader>System Logs</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <LogsViewer height="400px" />
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NavbarLogsModal;
