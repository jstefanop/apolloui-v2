// components/setup/StepMiningType.js
import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import Card from '../card/Card';
import { useIntl } from 'react-intl';

const StepMiningType = ({ setStep, isOpen, onOpen, onClose, isNodeSynced }) => {
  const intl = useIntl();

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      mx="auto"
      maxW={{ base: '100%', xl: '60%' }}
    >
      <Box alignSelf="flex-start" mb="10">
        <Heading color="white" fontSize="42px" mt="10">
          {intl.formatMessage({ id: 'setup.mining_type.title' })}
        </Heading>
      </Box>
      {!isNodeSynced && (
        <Alert status="warning" mb="10" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>{intl.formatMessage({ id: 'setup.mining_type.node_not_synced.title' })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage({ id: 'setup.mining_type.node_not_synced.description' })}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      <Flex flexDir={{ base: 'column', md: 'row' }} justifyContent="center">
        <Card
          onClick={onOpen}
          cursor="pointer"
          h="auto"
          mx="20px"
          p="50px"
          border="2px solid"
          borderColor="blue.900"
          bg="brand.800"
          opacity="0.8"
        >
          <Button
            variant="outline"
            size="lg"
            colorScheme="white"
            textColor="white"
            onClick={onOpen}
          >
            {intl.formatMessage({ id: 'setup.mining_type.solo.title' })}
          </Button>
          <Text mt="20px" color="gray.400" fontWeight="400" fontSize="md">
            {intl.formatMessage({ id: 'setup.mining_type.solo.description' })}
          </Text>
        </Card>

        <Card
          onClick={() => setStep(3)}
          h="auto"
          mx="20px"
          p="50px"
          border="2px solid"
          borderColor="teal.900"
          bg="brand.800"
          opacity="0.8"
        >
          <Button
            variant="outline"
            size="lg"
            colorScheme="white"
            textColor="white"
            onClick={() => setStep(3)}
          >
            {intl.formatMessage({ id: 'setup.mining_type.pool.title' })}
          </Button>
          <Text mt="20px" color="gray.400" fontWeight="400" fontSize="md">
            {intl.formatMessage({ id: 'setup.mining_type.pool.description' })}
          </Text>
        </Card>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{intl.formatMessage({ id: 'setup.mining_type.disclaimer.title' })}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {intl.formatMessage({ id: 'setup.mining_type.disclaimer.part1' })}
            </Text>

            <Text>
              {intl.formatMessage({ id: 'setup.mining_type.disclaimer.part2' })}
            </Text>

            <Text>
              {intl.formatMessage({ id: 'setup.mining_type.disclaimer.part3' })}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setStep('wallet')}>
              {intl.formatMessage({ id: 'setup.mining_type.disclaimer.accept' })}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {intl.formatMessage({ id: 'setup.mining_type.disclaimer.cancel' })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default StepMiningType;
