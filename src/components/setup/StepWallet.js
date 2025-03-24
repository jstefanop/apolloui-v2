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
} from '@chakra-ui/react';
import Card from '../card/Card';

const StepWallet = ({
  poolUsername,
  setPoolUsername,
  poolError,
  setPoolError,
  handlesSetupSoloMining,
  error,
  setStep,
}) => (
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
              <Input
                value={poolUsername}
                isInvalid={poolError && !poolUsername}
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
                onChange={(e) => setPoolUsername(e.target.value)}
              />
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
          <Button type="submit">Next</Button>
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

export default StepWallet;
