// components/setup/StepWallet.js
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Card from '../card/Card';
import { isValidBitcoinAddress, isCompatibleBitcoinAddress } from '../../lib/utils';
import { useState, useEffect } from 'react';

const StepWallet = ({
  poolUsername,
  setPoolUsername,
  poolError,
  setPoolError,
  handlesSetupSoloMining,
  error,
  setStep,
}) => {
  const [isValid, setIsValid] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Reset validation state when poolUsername changes from outside
  useEffect(() => {
    if (poolUsername) {
      setShowValidation(true);
      const valid = isValidBitcoinAddress(poolUsername);
      const compatible = isCompatibleBitcoinAddress(poolUsername);
      setIsValid(valid);
      setIsCompatible(compatible);
    } else {
      setShowValidation(false);
      setIsValid(false);
      setIsCompatible(false);
    }
  }, [poolUsername]);

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setPoolUsername(address);
    
    // Clear previous error
    setPoolError(null);
    
    // Show validation after first character is typed
    if (address) {
      setShowValidation(true);
      const valid = isValidBitcoinAddress(address);
      const compatible = isCompatibleBitcoinAddress(address);
      setIsValid(valid);
      setIsCompatible(compatible);
      
      if (!valid) {
        setPoolError('Please add a valid Bitcoin address');
      } else if (!compatible) {
        setPoolError('P2WSH and P2TR Bitcoin addresses are not valid for solo mining');
      }
    } else {
      setShowValidation(false);
      setIsValid(false);
      setIsCompatible(false);
    }
  };

  // Determine if the address is fully valid (both valid and compatible)
  const isFullyValid = isValid && isCompatible;

  return (
    <Flex flexDir="column" alignItems="center" mx="auto" w="80%">
      <Box alignSelf="flex-start">
        <Heading color="white" fontSize="42px" mt="10">
          Set wallet address
        </Heading>
      </Box>

      <Card h="max-content" mx="auto" mt="40px" mb="50px" p="50px">
        <form onSubmit={handlesSetupSoloMining}>
          <Stack spacing="20px">
            <SimpleGrid columns={1} gap="20px">
              <Flex direction="column">
                <FormLabel htmlFor="poolUsername" color="white" fontWeight="bold">
                  Wallet address *
                </FormLabel>
                <InputGroup>
                  <Input
                    value={poolUsername}
                    isInvalid={showValidation && !isFullyValid}
                    id="poolUsername"
                    type="text"
                    fontWeight="500"
                    variant="main"
                    placeholder={'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                    _placeholder={{
                      fontWeight: '400',
                      color: 'secondaryGray.600',
                    }}
                    h="44px"
                    maxh="44px"
                    onChange={handleAddressChange}
                  />
                  {showValidation && (
                    <InputRightElement h="44px">
                      {isFullyValid ? (
                        <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                      ) : (
                        <Icon as={FaTimesCircle} color="red.500" boxSize={5} />
                      )}
                    </InputRightElement>
                  )}
                </InputGroup>
              </Flex>
            </SimpleGrid>
          </Stack>

          {poolError && (
            <Text color="red.500" mt="20px">
              {poolError}
            </Text>
          )}

          <Flex justify="space-between" mt="40px">
            <Button onClick={() => setStep('mining')}>Previous</Button>
            <Button 
              type="submit" 
              isDisabled={showValidation && !isFullyValid}
            >
              Next
            </Button>
          </Flex>
          {error && (
            <Text color="red" mt="4">
              {error}
            </Text>
          )}
        </form>
      </Card>
    </Flex>
  );
};

export default StepWallet;
