import { useEffect, useState } from 'react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
// Chakra imports
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
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import Head from 'next/head';
import Card from '../components/card/Card';
import { useRouter } from 'next/router';
import { MINER_RESTART_QUERY } from '../graphql/miner';
import { AUTH_LOGIN_QUERY, SAVE_SETUP_QUERY } from '../graphql/auth';
import { useLazyQuery } from '@apollo/client';
import { SET_POOLS_QUERY } from '../graphql/pools';
import { SET_SETTINGS_QUERY } from '../graphql/settings';
import { isValidBitcoinAddress, presetPools } from '../lib/utils';

const Setup = () => {
  const router = useRouter();
  // Chakra color mode
  const textButtonColor = useColorModeValue('white', 'white');
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'gray.400';
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState();
  const [soloMining, setSoloMining] = useState(false);
  const [pool, setPool] = useState();
  const [poolUsername, setPoolUsername] = useState('');
  const [poolPassword, setPoolPassword] = useState('');
  const [poolUrl, setPoolUrl] = useState('');
  const [poolError, setPoolError] = useState();
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [token, setToken] = useState();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [
    restartMiner,
    { loading: loadingMinerRestart, error: errorMinerRestart },
  ] = useLazyQuery(MINER_RESTART_QUERY, { fetchPolicy: 'no-cache' });

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

  const [saveSettings, { loading: loadingSave, error: errorSave }] =
    useLazyQuery(SET_SETTINGS_QUERY, { fetchPolicy: 'no-cache' });

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

    if (soloMining) {
      saveSettings({
        variables: { input: { nodeEnableSoloMining: true } },
      });
    }

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
  }, [
    token,
    soloMining,
    poolUrl,
    poolUsername,
    poolPassword,
    createPool,
    saveSettings,
  ]);

  useEffect(() => {
    setPoolError(null);
    setError(null);
    onClose();
    if (step === 'mining') {
      setPoolUsername('');
      setPoolPassword('');
      setPoolUrl('');
      setPool(null);
      setSoloMining(false);
      setPassword('');
      setVerifyPassword('');
    }
  }, [step, onClose]);

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
    if (!poolUrl.match(/stratum\+tcp:\/\/(.*):?\d*$/))
      return setPoolError('Invalid pool URL');

    setPool({
      ...pool,
      username: poolUsername,
      password: poolPassword,
      url: poolUrl,
    });

    setStep(3);
  };

  const handlesSetupSoloMining = async (e) => {
    e.preventDefault();
    try {
      setPoolError(null);
      if (!poolUsername) return setPoolError('All fields are required');

      if (!isValidBitcoinAddress(poolUsername))
        return setPoolError('Please add a valid Bitcoin address');

      const soloUrl = 'stratum+tcp://127.0.0.1:3333';
      const soloPassword = 'x';

      setPoolUrl(soloUrl);
      setPoolPassword(soloPassword);

      setPool({
        username: poolUsername,
        password: soloPassword,
        url: soloUrl,
        index: 1,
      });

      setSoloMining(true);

      setStep(3);
    } catch (error) {
      dispatch(sendFeedback({ message: error.toString(), type: 'error' }));
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();

    if (!password || !verifyPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== verifyPassword) {
      setError('Passwords do not match');
      return;
    }

    await saveSetup({ variables: { input: { password } } });

    await signin({ variables: { input: { password } } });

    setStep(4);
  };

  const handleStartMining = () => {
    restartMiner();
    router.replace('/signin');
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
              onClick={() => setStep('mining')}
            >
              Start setup process
            </Button>
          </Flex>
        </Box>
      )}

      {step === 'mining' && (
        <Flex
          flexDir={'column'}
          alignItems="center"
          my="0"
          mx="auto"
          maxW={{ base: '80%', xl: '60%' }}
        >
          <Box alignSelf={'flex-start'}>
            <Heading color={'white'} fontSize="42px" mt="10">
              Select mining type
            </Heading>
          </Box>

          <Flex
            mx={{ base: '0px', lg: '0px' }}
            justifyContent="center"
            px={{ base: '0px', md: '0px' }}
            flexDirection="row"
          >
            <Card
              h={{base: 'auto', md: '400px' }}
              mx={{ base: '10px', md: '20px' }}
              mt={{ base: '40px' }}
              mb={{ base: '50px', lg: 'auto' }}
              p={{ base: '10px', md: '50px' }}
              pt={{ base: '30px', md: '50px' }}
              pb={{ base: '20px', md: '20px' }}
              bg="brand.800"
              border="2px solid"
              borderColor="blue.900"
              onClick={onOpen}
              opacity={'0.8'}
            >
              <Button
                variant="outline"
                size="lg"
                textColor={textButtonColor}
                onClick={onOpen}
                colorScheme='white'
              >
                Solo Mining
              </Button>
              <Text
                mt="20px"
                color={textColorSecondary}
                fontWeight="400"
                fontSize="md"
              >
                You are competing with the entire network for a full Bitcoin
                Block (the whole 6.25 BTC reward). You gain zero rewards while
                mining, in hopes of hitting the entire block. This is also
                called &quot;lottery&quot; mining because the chances are low,
                but this produces the maximum decentralization of the bitcoin
                network. If there are millions of solo miners then solo blocks
                will be found every day and ensure Bitcoin can never be
                censored!
              </Text>
            </Card>
            <Card
              h={{ base: 'auto', md: '400px' }}
              mx={{ base: '10px', md: '20px' }}
              mt={{ base: '40px' }}
              mb={{ base: '50px', lg: 'auto' }}
              p={{ base: '10px', md: '50px' }}
              pt={{ base: '30px', md: '50px' }}
              pb={{ base: '20px', md: '20px' }}
              bg="brand.800"
              border="2px solid"
              borderColor="teal.900"
              onClick={() => setStep(2)}
              opacity={'0.8'}
            >
              <Button
                variant="outline"
                size="lg"
                textColor={textButtonColor}
                onClick={() => setStep(2)}
                colorScheme='white'
              >
                Pooled Mining
              </Button>
              <Text
                mt="20px"
                color={textColorSecondary}
                fontWeight="400"
                fontSize="md"
              >
                You are contributing your hashrate to a collective
                &quot;pool&quot; that is competing to find a block. This
                produces daily rewards in mined &quot;satoshis&quot; because
                once your pool finds a block, it shares that block reward with
                you based on your % of hashrate contributed to the pool. These
                is the least decentralized form of mining, because you give
                control of block creation to the pool. Please note most pools
                have minimum payouts, that can take months of mining before you
                accumulate enough for a payout.
              </Text>
            </Card>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                Legal Disclaimer for Solo Mining with Apollo II
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  The Apollo II offers enhanced features for solo mining,
                  including the ability to launch your own Stratum solo pool
                  with a simple toggle in the user interface. While these
                  features are designed for ease of use and efficiency, solo
                  mining inherently carries certain risks that users must be
                  aware of. Specifically, the process of solo mining is
                  sensitive to network conditions. Factors such as Bitcoin
                  network congestion, network latency and upload speeds can
                  impact the successful submission of a solo block to the
                  Bitcoin network.
                </Text>

                <Text>
                  Due to the decentralized and competitive nature of the Bitcoin
                  network, a block mined by the user may be orphaned and not
                  accepted by the network, especially in cases of high network
                  latency or suboptimal connection speeds. While FutureBit has
                  engineered the Apollo II to minimize such risks at a device
                  level, the outcome of solo mining activities is influenced by
                  factors beyond our control.
                </Text>

                <Text>
                  By using the Apollo II for solo mining, users acknowledge and
                  accept that FutureBit is not responsible for any lost or
                  orphaned solo blocks that may occur as a result of hardware
                  issues, software issues, network conditions including but not
                  limited to latency and connection stability. FutureBit
                  disclaims any liability for losses or damages resulting from
                  solo mining activities. Users engage in solo mining at their
                  own risk and are advised to ensure a high-speed, stable
                  Ethernet connection for optimal performance.
                </Text>
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => setStep('wallet')}
                >
                  Accept
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>
      )}

      {step === 'wallet' && (
        <Flex
          flexDir={'column'}
          alignItems="center"
          my="0"
          mx="auto"
          maxW={{ base: '100%', md: '60%' }}
        >
          <Box alignSelf={'flex-start'}>
            <Heading color={'white'} fontSize="42px" mt="10">
              Set wallet address
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
                  Enter your wallet address for solo mining payout. This is the
                  address the full block reward will go to if you find a block.
                  Do NOT use an exchange address, and only use a Bitcoin address 
                  you fully control. 
                  If your unit came with a FutureBit Satscard, you can tap the
                  card on an NFC enable phone to view the payout address, and
                  copy and paste the address below. Please note you will not 
                  start solo mining until your node is fully synced, which can
                  take several days. 
                </Text>
              </Box>
              <Flex direction="column">
                <form onSubmit={handlesSetupSoloMining}>
                  <Stack direction="column" spacing="20px">
                    <SimpleGrid columns={{ base: '1', md: '1' }} gap="20px">
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
                          Wallet address
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
                    <Flex justify="space-between" my="40px">
                      <Text color="red.500" fontSize="sm">
                        {poolError}
                      </Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" my="40px">
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      type="button"
                      onClick={() => setStep('mining')}
                    >
                      Previous
                    </Button>
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

      {step === 2 && (
        <Flex
          flexDir={'column'}
          alignItems="center"
          my="0"
          mx="auto"
          maxW={{ base: '100%', md: '60%' }}
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
                  Enter your pool information below, or get started quickly with one 
                  of our suggested pools. If a pool only requires a payout address you 
                  can enter your Bitcoin address in the username field (if your unit 
                  came with a FutureBit Satscard, tap it, copy the address and enter it here!). 
                  Some pools require you to setup an account first, so follow their instructions
                  before setting it up here. Password field can be anything for most pools. 
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
                  {poolError && (
                    <Flex justify="space-between" my="40px">
                      <Text color="red.500" fontSize="sm">
                        {poolError}
                      </Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" my="40px">
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      type="button"
                      onClick={() => setStep('mining')}
                    >
                      Previous
                    </Button>
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
          maxW={{ base: '100%', md: '60%' }}
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
                      {/* Verify Password */}
                      <Flex direction="column">
                        <FormLabel
                          display="flex"
                          ms="10px"
                          htmlFor={'verifyPassword'}
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          _hover={{ cursor: 'pointer' }}
                        >
                          Verify Password
                          <Text fontSize="sm" fontWeight="400" ms="2px">
                            *
                          </Text>
                        </FormLabel>
                        <InputGroup size="md">
                          <Input
                            value={verifyPassword}
                            type={showPassword ? 'text' : 'password'}
                            id={'verifyPassword'}
                            isRequired={true}
                            fontWeight="500"
                            variant="main"
                            h="44px"
                            maxh="44px"
                            onChange={(e) => setVerifyPassword(e.target.value)}
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
                  {error && (
                    <Flex justify="space-between" my="20px">
                      <Text color="red">{error}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" mt="80px" mb="40px">
                    <Button
                      variant="brand"
                      fontSize="sm"
                      borderRadius="16px"
                      w={{ base: '148px', md: '168px' }}
                      h="46px"
                      onClick={() => setStep('mining')}
                    >
                      Previous
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
              Your Setup is complete!
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
              onClick={() => handleStartMining()}
              isDisabled={loadingMinerRestart}
              isLoading={loadingMinerRestart}
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
