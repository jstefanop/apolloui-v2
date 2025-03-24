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
} from '@chakra-ui/react';
import Card from '../card/Card';

const StepMiningType = ({ setStep, isOpen, onOpen, onClose, isNodeSynced }) => {
  return (
    <Flex
      flexDir="column"
      alignItems="center"
      mx="auto"
      maxW={{ base: '100%', xl: '60%' }}
    >
      <Box alignSelf="flex-start" mb="10">
        <Heading color="white" fontSize="42px" mt="10">
          Select mining type
        </Heading>
      </Box>
      <Flex flexDir={{ base: 'column', md: 'row' }} justifyContent="center">
        <Card
          onClick={isNodeSynced ? onOpen : null}
          cursor={isNodeSynced ? 'pointer' : 'not-allowed'}
          h="auto"
          mx="20px"
          p="50px"
          border="2px solid"
          borderColor="blue.900"
          bg="brand.800"
          opacity={isNodeSynced ? '0.8' : '0.4'}
        >
          <Button
            variant="outline"
            size="lg"
            colorScheme="white"
            textColor="white"
            onClick={isNodeSynced ? onOpen : null}
            isDisabled={!isNodeSynced}
          >
            Solo Mining
          </Button>
          <Text mt="20px" color="gray.400" fontWeight="400" fontSize="md">
            You are competing with the entire network for a full Bitcoin Block
            (the whole BTC reward). You gain zero rewards while mining, in hopes
            of hitting the entire block. This is also called &quot;lottery&quot;
            mining because the chances are low, but this produces the maximum
            decentralization of the bitcoin network. If there are millions of
            solo miners then solo blocks will be found every day and ensure
            Bitcoin can never be censored!
          </Text>
          {!isNodeSynced && (
            <Text mt="10px" color="red.300" fontSize="sm">
              Node must be fully synced to enable Solo Mining. You can select this later once sync is complete.
            </Text>
          )}
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
            Pooled Mining
          </Button>
          <Text mt="20px" color="gray.400" fontWeight="400" fontSize="md">
            You are contributing your hashrate to a collective &quot;pool&quot;
            that is competing to find a block. This produces daily rewards in
            mined &quot;satoshis&quot; because once your pool finds a block, it
            shares that block reward with you based on your % of hashrate
            contributed to the pool. These is the least decentralized form of
            mining, because you give control of block creation to the pool.
            Please note most pools have minimum payouts, that can take months of
            mining before you accumulate enough for a payout.
          </Text>
        </Card>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Legal Disclaimer for Solo Mining</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              The Apollo II offers enhanced features for solo mining, including
              the ability to launch your own Stratum solo pool with a simple
              toggle in the user interface. While these features are designed
              for ease of use and efficiency, solo mining inherently carries
              certain risks that users must be aware of. Specifically, the
              process of solo mining is sensitive to network conditions. Factors
              such as Bitcoin network congestion, network latency and upload
              speeds can impact the successful submission of a solo block to the
              Bitcoin network.
            </Text>

            <Text>
              Due to the decentralized and competitive nature of the Bitcoin
              network, a block mined by the user may be orphaned and not
              accepted by the network, especially in cases of high network
              latency or suboptimal connection speeds. While FutureBit has
              engineered the Apollo II to minimize such risks at a device level,
              the outcome of solo mining activities is influenced by factors
              beyond our control.
            </Text>

            <Text>
              By using the Apollo II for solo mining, users acknowledge and
              accept that FutureBit is not responsible for any lost or orphaned
              solo blocks that may occur as a result of hardware issues,
              software issues, network conditions including but not limited to
              latency and connection stability. FutureBit disclaims any
              liability for losses or damages resulting from solo mining
              activities. Users engage in solo mining at their own risk and are
              advised to ensure a high-speed, stable Ethernet connection for
              optimal performance.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setStep('wallet')}>
              Accept
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default StepMiningType;
