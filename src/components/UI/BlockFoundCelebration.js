import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Flex,
  Text,
  useColorModeValue,
  CloseButton,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { RESET_BLOCK_FOUND_QUERY } from '../../graphql/miner';
import { sendFeedback } from '../../redux/slices/feedbackSlice';
import { FaBitcoin, FaTrophy } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import Confetti from './Confetti';

const BlockFoundCelebration = ({ blockFound }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue('yellow.100', 'yellow.900');
  const borderColor = useColorModeValue('yellow.500', 'yellow.600');
  const textColor = useColorModeValue('yellow.800', 'yellow.200');

  const [resetBlockFound, { loading }] = useLazyQuery(RESET_BLOCK_FOUND_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      toast({
        title: 'Block found flag reset',
        description: 'The block found notification has been reset',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setShowCelebration(false);
    },
    onError: (error) => {
      dispatch(
        sendFeedback({
          message: `Error resetting block found flag: ${error.message}`,
          type: 'error',
        })
      );
    },
  });

  useEffect(() => {
    if (blockFound) {
      setShowCelebration(true);
    }
  }, [blockFound]);

  const handleReset = () => {
    resetBlockFound();
  };

  if (!showCelebration) return null;

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert
          status="success"
          variant="solid"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={5}
          mt={10}
          mb={0}
          borderWidth="2px"
          borderColor={borderColor}
          bg={bgColor}
          color={textColor}
          position="relative"
          width={{ base: '100%', xl: '60%' }}
          mx="auto"
        >
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={handleReset}
          />

          <Flex align="center" mb={4}>
            <Box as={FaBitcoin} size="40px" mr={3} />
            <AlertTitle fontSize="3xl" fontWeight="extrabold">
              CONGRATULATIONS!
            </AlertTitle>
            <Box as={GiPartyPopper} size="40px" ml={3} />
          </Flex>

          <Box as={FaTrophy} size="60px" mb={4} color="yellow.500" />

          <AlertDescription maxWidth="lg" fontSize="xl">
            <Text fontWeight="bold" mb={4}>
              Your miner has found a Bitcoin block!
            </Text>
            <Text mb={4}>
              This is an extraordinary achievement in the world of Bitcoin
              mining. You&apos;ve successfully mined an entire block and earned the
              full block reward!
            </Text>
          </AlertDescription>

          <Button
            mt={4}
            colorScheme="yellow"
            size="lg"
            onClick={handleReset}
            isLoading={loading}
            loadingText="Resetting..."
          >
            Acknowledge & Reset
          </Button>
        </Alert>
      </motion.div>
    </>
  );
};

export default BlockFoundCelebration;
