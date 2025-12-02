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
import { useIntl } from 'react-intl';

const StepWallet = ({
  poolUsername,
  setPoolUsername,
  poolError,
  setPoolError,
  handlesSetupSoloMining,
  error,
  setStep,
  isSoloNode = false,
}) => {
  const intl = useIntl();
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
        setPoolError(intl.formatMessage({ id: 'setup.wallet.error.invalid_address' }));
      } else if (!compatible) {
        setPoolError(intl.formatMessage({ id: 'setup.wallet.error.incompatible_address' }));
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
          {intl.formatMessage({ id: 'setup.wallet.title' })}
        </Heading>
        <Text mt="20px" color="gray.400" fontWeight="400" fontSize="md">
          {intl.formatMessage({ id: 'setup.mining_type.solo.description' })}
        </Text>
      </Box>

      <Card h="max-content" mx="auto" mt="40px" mb="50px" p="50px">
        <form onSubmit={handlesSetupSoloMining}>
          <Stack spacing="20px">
            <SimpleGrid columns={1} gap="20px">
              <Flex direction="column">
                <FormLabel htmlFor="poolUsername" color="white" fontWeight="bold">
                  {intl.formatMessage({ id: 'setup.wallet.address_label' })} *
                </FormLabel>
                <InputGroup>
                  <Input
                    value={poolUsername}
                    isInvalid={showValidation && !isFullyValid}
                    id="poolUsername"
                    type="text"
                    fontWeight="500"
                    variant="main"
                    placeholder={intl.formatMessage({ id: 'setup.wallet.address_placeholder' })}
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
            {!isSoloNode && (
              <Button onClick={() => setStep('mining')}>
                {intl.formatMessage({ id: 'setup.common.previous' })}
              </Button>
            )}
            {isSoloNode && (
              <Button onClick={() => setStep(2)}>
                {intl.formatMessage({ id: 'setup.common.previous' })}
              </Button>
            )}
            <Button 
              type="submit" 
              isDisabled={showValidation && !isFullyValid}
              ml={isSoloNode ? 'auto' : '0'}
            >
              {intl.formatMessage({ id: 'setup.common.next' })}
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
