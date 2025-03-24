// components/setup/StepPassword.js
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
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import Card from '../card/Card';

const StepPassword = ({
  password,
  setPassword,
  verifyPassword,
  setVerifyPassword,
  showPassword,
  setShowPassword,
  error,
  handlePassword,
  setStep,
}) => (
  <Flex flexDir="column" alignItems="center" mx="auto" w="80%">
    <Box alignSelf="flex-start">
      <Heading color="white" fontSize="42px" mt="10">
        Set lock and system password
      </Heading>
    </Box>

    <Card h="max-content" mx="auto" mt="40px" mb="50px" p="50px">
      <form onSubmit={handlePassword}>
        <Stack spacing="20px">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
            <Flex direction="column">
              <FormLabel htmlFor="password" color="white" fontWeight="bold">
                Password *
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  fontWeight="500"
                  variant="main"
                  placeholder={''}
                  _placeholder={{
                    fontWeight: '400',
                    color: 'secondaryGray.600',
                  }}
                  h="44px"
                  maxh="44px"
                  onChange={(e) => setPassword(e.target.value)}
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

            <Flex direction="column">
              <FormLabel
                htmlFor="verifyPassword"
                color="white"
                fontWeight="bold"
              >
                Verify Password *
              </FormLabel>
              <InputGroup>
                <Input
                  id="verifyPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={verifyPassword}
                  fontWeight="500"
                  variant="main"
                  placeholder={''}
                  _placeholder={{
                    fontWeight: '400',
                    color: 'secondaryGray.600',
                  }}
                  h="44px"
                  maxh="44px"
                  onChange={(e) => setVerifyPassword(e.target.value)}
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

        {error && (
          <Text color="red" mt="4">
            {error}
          </Text>
        )}

        <Flex justify="space-between" mt="80px">
          <Button onClick={() => setStep('mining')}>Previous</Button>
          <Button type="submit">Next</Button>
        </Flex>
      </form>
    </Card>
  </Flex>
);

export default StepPassword;
