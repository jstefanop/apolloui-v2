import { useEffect, useState } from 'react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
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
  useColorModeValue,
} from '@chakra-ui/react';
import Head from 'next/head';
import Card from '../components/card/Card';
import { useRouter } from 'next/router';
import { AUTH_LOGIN_QUERY, SAVE_SETUP_QUERY } from '../graphql/auth';
import { useLazyQuery } from '@apollo/client';
import { SET_POOLS_QUERY } from '../graphql/pools';

const Setup = () => {
  const router = useRouter();
  // Chakra color mode
  const textButtonColor = useColorModeValue('white', 'brand.800');
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState();
  const [pool, setPool] = useState();
  const [poolUsername, setPoolUsername] = useState('');
  const [poolPassword, setPoolPassword] = useState('');
  const [poolUrl, setPoolUrl] = useState('');
  const [poolError, setPoolError] = useState();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState();

  const presetPools = [
    {
      name: 'AntPool',
      url: 'stratum+tcp://ss.antpool.com:3333',
      webUrl: 'https://www.antpool.com/',
    },
    {
      name: 'F2Pool',
      url: 'stratum+tcp://btc.f2pool.com:1314',
      webUrl: 'https://www.f2pool.com/',
    },
    {
      name: 'ViaBTC',
      url: 'stratum+tcp://btc.viabtc.io:3333',
      webUrl: 'https://www.viabtc.com/',
    },
    {
      name: 'Braiins',
      url: 'stratum+tcp://stratum.braiins.com:3333',
      webUrl: 'https://braiins.com/pool',
    },
    {
      id: 'custom',
      name: 'New custom pool',
    },
  ];

  const [
    saveSetup,
    { data: dataSaveSetup, loading: loadingSaveSetup, error: errorSaveSetup },
  ] = useLazyQuery(SAVE_SETUP_QUERY, { fetchPolicy: 'no-cache' });

  const [
    signin,
    { data: dataSignin, loading: loadingSignin, error: errorSignin },
  ] = useLazyQuery(AUTH_LOGIN_QUERY, { fetchPolicy: 'no-cache' });

  const [
    createPool,
    { data: dataSetPool, loading: loadingSetPool, error: errorSetPool },
  ] = useLazyQuery(SET_POOLS_QUERY, { fetchPolicy: 'no-cache' });

  useEffect(() => {
    if (dataSaveSetup?.Auth?.setup?.error)
      setError(dataSaveSetup.Auth.setup.error.message);
    if (dataSignin?.Auth?.login?.error)
      setError(dataSignin.Auth.login.error.message);
    if (errorSignin) setError(errorSignin);
    if (errorSaveSetup) setError(errorSaveSetup);

    if (dataSignin?.Auth?.login?.result)
      setToken(dataSignin.Auth.login.result.accessToken);
  }, [dataSaveSetup, dataSignin, errorSignin, errorSaveSetup]);

  useEffect(() => {
    if (!token) return;
    
    localStorage.setItem('token', token);

    createPool({
      variables: {
        input: {
          enabled: true,
          url: poolUrl,
          username: poolUsername,
          password: poolPassword,
          index: 1,
        },
      },
    });
  }, [token]);

  const handleChangePool = (e) => {
    const preset = presetPools[e.target.value];
    if (preset && preset.id !== 'custom') setPoolUrl(preset.url);
    setPool(preset);
  };

  const handleSetupPool = async (e) => {
    e.preventDefault();

    setPoolError(null);
    if (!poolUsername || !poolPassword || !poolUrl)
      return setPoolError('All fields are required');
    if (!poolUrl.match(/stratum\+tcp:\/\/(.*)/))
      return setPoolError('Invalid pool URL');

    setPool({
      ...pool,
      username: poolUsername,
      password: poolPassword,
      url: poolUrl,
    });

    setStep(3);
  };

  const handleComplete = async (e) => {
    e.preventDefault();

    await saveSetup({ variables: { input: { password } } });

    await signin({ variables: { input: { password } } });

    setStep(4);
  };

  return (
    <>
      <Head>
        <title>Setup your Apollo BTC</title>
      </Head>
      {step === 1 && (
        <Box mx="auto" py="150px">
          <Flex flexDir={'column'}>
            <Text
              fontSize={'4xl'}
              fontWeight="700"
              lineHeight={'8'}
              color={'white'}
              mb="10"
            >
              One node. One miner. One person.
              <br />
              Welcome.
            </Text>
            <Button
              type="submit"
              fontSize="sm"
              bgColor={'white'}
              color={'brand.800'}
              fontWeight="500"
              w="300px"
              h="50"
              mb="24px"
              onClick={() => setStep(2)}
            >
              Start setup process
            </Button>
          </Flex>
        </Box>
      )}
      {step === 2 && (
        <Flex
          flexDir={'column'}
          alignItems="center"
          my="0"
          mx="auto"
          maxW={{ base: '80%', xl: '60%' }}
        >
          <Box alignSelf={'flex-start'}>
            <Heading color={'white'} fontSize="42px" mt="10">
              Set mining pool
            </Heading>
          </Box>

          <Card
            h="max-content"
            mx="auto"
            mt={{ base: '40px' }}
            mb={{ base: '50px', lg: 'auto' }}
            p={{ base: '10px', md: '50px' }}
            pt={{ base: '30px', md: '50px' }}
            pb={{ base: '20px', md: '20px' }}
          >
            <Flex
              mx={{ base: 'auto', lg: '0px' }}
              me="auto"
              justifyContent="center"
              px={{ base: '20px', md: '0px' }}
              flexDirection="column"
            >
              <Box me="auto" mb="30px">
                <Text
                  mb="10px"
                  color={textColorSecondary}
                  fontWeight="400"
                  fontSize="md"
                >
                  Welcome to your Apollo BTC miner setup. First of all your
                  miner needs a Bitcoin pool to connect to, we are suggesting
                  you some below or you can add your custom one. Please remember
                  to add username and password pool too.
                </Text>
              </Box>
              <Flex direction="column">
                <form onSubmit={handleSetupPool}>
                  <Stack direction="column" spacing="20px">
                    <SimpleGrid columns={{ base: '1', md: '2' }} gap="20px">
                      {/* Pool */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'poolPreset'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Select a pool
                          <Flex flexDir="row">
                            <Text
                              fontSize="sm"
                              fontWeight="400"
                              ms="2px"
                              mr="5"
                            >
                              *
                            </Text>
                            {pool && pool.webUrl && (
                              <a
                                href={pool.webUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Learn more
                              </a>
                            )}
                          </Flex>
                        </FormLabel>
                        <Select
                          id="poolPreset"
                          isRequired={true}
                          fontSize="sm"
                          size="lg"
                          variant="auth"
                          label="Select a pool *"
                          onChange={handleChangePool}
                        >
                          <option></option>
                          {presetPools.map((item, index) => (
                            <option
                              value={index}
                              key={index}
                              selected={pool && item.name === pool.name}
                            >
                              {item.name}
                            </option>
                          ))}
                        </Select>
                      </Flex>

                      {/* Url */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'poolUrl'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Url
                          <Text fontSize="sm" fontWeight="400" ms="2px">
                            *
                          </Text>
                        </FormLabel>
                        <Input
                          isInvalid={poolError}
                          type="text"
                          id={'poolUrl'}
                          isRequired={true}
                          isDisabled={pool?.id === 'custom' ? false : true}
                          value={poolUrl}
                          fontWeight="500"
                          variant="main"
                          placeholder={'stratum+tcp://ss.antpool.com:3333'}
                          _placeholder={{
                            fontWeight: '400',
                            color: 'secondaryGray.600',
                          }}
                          h="46px"
                          maxh="46px"
                          onChange={(e) => setPoolUrl(e.target.value)}
                        />
                      </Flex>

                      {/* Username */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'poolUsername'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Username
                          <Text fontSize="sm" fontWeight="400" ms="2px">
                            *
                          </Text>
                        </FormLabel>
                        <Input
                          value={poolUsername}
                          isInvalid={poolError && !poolUsername}
                          type="text"
                          id={'poolUsername'}
                          isRequired={true}
                          fontWeight="500"
                          variant="main"
                          placeholder={'futurebit.worker1'}
                          _placeholder={{
                            fontWeight: '400',
                            color: 'secondaryGray.600',
                          }}
                          h="44px"
                          maxh="44px"
                          onChange={(e) => setPoolUsername(e.target.value)}
                        />
                      </Flex>

                      {/* Password */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'poolPassword'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Password
                          <Text fontSize="sm" fontWeight="400" ms="2px">
                            *
                          </Text>
                        </FormLabel>
                        <InputGroup size="md">
                          <Input
                            value={poolPassword}
                            isInvalid={poolError && !poolPassword}
                            type={showPassword ? 'text' : 'password'}
                            id={'poolPassword'}
                            isRequired={true}
                            fontWeight="500"
                            variant="main"
                            placeholder={'x'}
                            _placeholder={{
                              fontWeight: '400',
                              color: 'secondaryGray.600',
                            }}
                            h="44px"
                            maxh="44px"
                            onChange={(e) => setPoolPassword(e.target.value)}
                          />
                          <InputRightElement
                            display="flex"
                            alignItems="center"
                            mt="4px"
                          >
                            <Icon
                              color={textColorSecondary}
                              _hover={{ cursor: 'pointer' }}
                              as={
                                showPassword
                                  ? RiEyeCloseLine
                                  : MdOutlineRemoveRedEye
                              }
                              onClick={(e) => setShowPassword(!showPassword)}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </Flex>
                    </SimpleGrid>
                  </Stack>
                  <Flex justify="space-between" my="40px">
                    {poolError && (
                      <Text color="red.500" fontSize="sm">
                        {poolError}
                      </Text>
                    )}
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      ms="auto"
                      type="submit"
                    >
                      Next
                    </Button>
                  </Flex>
                </form>
                {error && (
                  <Flex align={'center'} direction="column">
                    <Text color="red">{error}</Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )}

      {step === 3 && (
        <Flex
          flexDir={'column'}
          alignItems="center"
          my="0"
          mx="auto"
          maxW={{ base: '80%', xl: '60%' }}
        >
          <Box alignSelf={'flex-start'}>
            <Heading color={'white'} fontSize="42px" mt="10">
              Set lock and system password
            </Heading>
          </Box>

          <Card
            h="max-content"
            mx="auto"
            mt={{ base: '40px' }}
            mb={{ base: '50px', lg: 'auto' }}
            p={{ base: '10px', md: '50px' }}
            pt={{ base: '30px', md: '50px' }}
            pb={{ base: '20px', md: '20px' }}
          >
            <Flex
              mx={{ base: 'auto', lg: '0px' }}
              me="auto"
              justifyContent="center"
              px={{ base: '20px', md: '0px' }}
              flexDirection="column"
            >
              <Box me="auto" mb="30px">
                <Text
                  mb="10px"
                  color={textColorSecondary}
                  fontWeight="400"
                  fontSize="md"
                >
                  Last thing, you need to a set a password for the lockscreen.
                  Remember, this will be your Linux user (futurebit) password
                  too. So if you&apos;d like to ssh into the miner you&apos;ll
                  need this same password you are setting now.
                </Text>
              </Box>
              <Flex direction="column">
                <form onSubmit={handleComplete}>
                  <Stack direction="column" spacing="20px">
                    <SimpleGrid columns={{ base: '1', md: '2' }} gap="20px">
                      {/* Password */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'password'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Password
                          <Text fontSize="sm" fontWeight="400" ms="2px">
                            *
                          </Text>
                        </FormLabel>
                        <InputGroup size="md">
                          <Input
                            value={password}
                            type={showPassword ? 'text' : 'password'}
                            id={'password'}
                            isRequired={true}
                            fontWeight="500"
                            variant="main"
                            h="44px"
                            maxh="44px"
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <InputRightElement
                            display="flex"
                            alignItems="center"
                            mt="4px"
                          >
                            <Icon
                              color={textColorSecondary}
                              _hover={{ cursor: 'pointer' }}
                              as={
                                showPassword
                                  ? RiEyeCloseLine
                                  : MdOutlineRemoveRedEye
                              }
                              onClick={(e) => setShowPassword(!showPassword)}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </Flex>
                    </SimpleGrid>
                  </Stack>
                  <Flex justify="space-between" mt="80px" mb="40px">
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      type="submit"
                    >
                      Complete
                    </Button>
                  </Flex>
                </form>
                {error && (
                  <Flex align={'center'} direction="column">
                    <Text color="red">{error}</Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )}
      {step === 4 && (
        <Box mx="auto" py="150px">
          <Flex flexDir={'column'}>
            <Text
              fontSize={'4xl'}
              fontWeight="700"
              lineHeight={'9'}
              color={'white'}
              mb="10"
            >
              Congratulation the setup is complete.
              <br />
              Let&apos;s start mining some Bitcoin!
            </Text>
            <Button
              type="submit"
              fontSize="sm"
              bgColor={'white'}
              color={'brand.800'}
              fontWeight="500"
              w="300px"
              h="50"
              mb="24px"
              onClick={() => router.replace('/signin')}
            >
              Start mining
            </Button>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default Setup;
