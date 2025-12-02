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
  useColorModeValue,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import Card from '../card/Card';
import { useIntl } from 'react-intl';

const StepPassword = ({
  password,
  setPassword,
  verifyPassword,
  setVerifyPassword,
  showPassword,
  setShowPassword,
  error,
  setError,
  handlePassword,
  setStep,
}) => {
  const intl = useIntl();
  
  // Theme colors
  const headingColor = useColorModeValue('white', 'white');
  const labelColor = useColorModeValue('brand.800', 'white');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  const buttonColor = useColorModeValue('gray.400', 'brand.300');

  const handlePasswordChange = (e) => {
    setError(null);
    setPassword(e.target.value);
  };

  const handleVerifyPasswordChange = (e) => {
    setError(null);
    setVerifyPassword(e.target.value);
  };

  return (
    <Flex flexDir="column" alignItems="center" mx="auto" w="80%">
      <Box alignSelf="flex-start">
        <Heading color={headingColor} fontSize="42px" mt="10">
          {intl.formatMessage({ id: 'setup.password.title' })}
        </Heading>
      </Box>

      <Card h="max-content" mx="auto" mt="40px" mb="50px" p="50px">
        <form onSubmit={handlePassword}>
          <Stack spacing="20px">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px">
              <Flex direction="column">
                <FormLabel htmlFor="password" color={labelColor} fontWeight="bold">
                  {intl.formatMessage({ id: 'setup.password.password_label' })} *
                </FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    fontWeight="500"
                    variant="main"
                    placeholder={intl.formatMessage({ id: 'setup.password.password_placeholder' })}
                    _placeholder={{
                      fontWeight: '400',
                      color: 'secondaryGray.600',
                    }}
                    h="44px"
                    maxh="44px"
                    onChange={handlePasswordChange}
                  />
                  <InputRightElement>
                    <Icon
                      as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      color={iconColor}
                      cursor="pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>

              <Flex direction="column">
                <FormLabel
                  htmlFor="verifyPassword"
                  color={labelColor}
                  fontWeight="bold"
                >
                  {intl.formatMessage({ id: 'setup.password.verify_label' })} *
                </FormLabel>
                <InputGroup>
                  <Input
                    id="verifyPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={verifyPassword}
                    fontWeight="500"
                    variant="main"
                    placeholder={intl.formatMessage({ id: 'setup.password.verify_placeholder' })}
                    _placeholder={{
                      fontWeight: '400',
                      color: 'secondaryGray.600',
                    }}
                    h="44px"
                    maxh="44px"
                    onChange={handleVerifyPasswordChange}
                  />
                  <InputRightElement>
                    <Icon
                      as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      color={iconColor}
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
            <Button bg={buttonColor} onClick={() => setStep(1)}>
              {intl.formatMessage({ id: 'setup.common.previous' })}
            </Button>
            <Button bg={buttonColor} type="submit">
              {intl.formatMessage({ id: 'setup.common.next' })}
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
};

export default StepPassword;
