// components/setup/StepPool.js
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import Card from '../card/Card';
import { presetPools } from '../../lib/utils';

const StepPool = ({
  pool,
  setPool,
  poolUrl,
  setPoolUrl,
  poolUsername,
  setPoolUsername,
  poolPassword,
  setPoolPassword,
  poolError,
  setPoolError,
  handleSetupPool,
  handleChangePool,
  showPassword,
  setShowPassword,
  error,
  setStep,
}) => (
  <Flex
    flexDir="column"
    alignItems="center"
    mx="auto"
    w={{ base: '100%', lg: '80%' }}
  >
    <Box alignSelf="flex-start">
      <Heading color="white" fontSize="42px" mt="10">
        Set mining pool
      </Heading>
    </Box>

    <Card
      h="max-content"
      mx="auto"
      mt="40px"
      mb="50px"
      p={{ base: '20px', md: '80px' }}
    >
      <form onSubmit={handleSetupPool}>
        <Stack spacing="20px">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
            <Flex direction="column">
              <FormLabel htmlFor="poolPreset" color="white" fontWeight="bold">
                Select a pool *
              </FormLabel>
              <Select
                id="poolPreset"
                onChange={handleChangePool}
                value={pool?.id || ''}
                fontSize="sm"
                size="lg"
                variant="auth"
                label="Select a pool *"
              >
                <option value=""></option>
                {presetPools.map((item, i) => (
                  <option value={i} key={i}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Flex>

            <Flex direction="column">
              <FormLabel htmlFor="poolUrl" color="white" fontWeight="bold">
                URL *
              </FormLabel>
              <Input
                id="poolUrl"
                value={poolUrl}
                onChange={(e) => setPoolUrl(e.target.value)}
                isInvalid={poolError}
                isDisabled={pool?.id !== 'custom'}
                fontWeight="500"
                variant="main"
                placeholder={'stratum+tcp://ss.antpool.com:3333'}
                _placeholder={{
                  fontWeight: '400',
                  color: 'secondaryGray.600',
                }}
                h="46px"
                maxh="46px"
              />
            </Flex>

            <Flex direction="column">
              <FormLabel htmlFor="poolUsername" color="white" fontWeight="bold">
                Username *
              </FormLabel>
              <Input
                id="poolUsername"
                value={poolUsername}
                onChange={(e) => setPoolUsername(e.target.value)}
                isInvalid={poolError && !poolUsername}
                fontWeight="500"
                variant="main"
                placeholder={'futurebit.worker1'}
                _placeholder={{
                  fontWeight: '400',
                  color: 'secondaryGray.600',
                }}
                h="44px"
                maxh="44px"
              />
            </Flex>

            <Flex direction="column">
              <FormLabel htmlFor="poolPassword" color="white" fontWeight="bold">
                Password *
              </FormLabel>
              <InputGroup>
                <Input
                  id="poolPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={poolPassword}
                  onChange={(e) => setPoolPassword(e.target.value)}
                  isInvalid={poolError && !poolPassword}
                  fontWeight="500"
                  variant="main"
                  placeholder={'x'}
                  _placeholder={{
                    fontWeight: '400',
                    color: 'secondaryGray.600',
                  }}
                  h="44px"
                  maxh="44px"
                />
                <InputRightElement>
                  <Icon
                    as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    color="gray.400"
                    cursor="pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
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

export default StepPool;
