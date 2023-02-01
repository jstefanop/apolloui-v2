import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Router } from 'next/router';
import Head from 'next/head';

const SignIn = () => {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState();

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleSignin = async (e) => {
    e.preventDefault();
    const response = await signIn('credentials', {
      password,
      redirect: false,
    });
    console.log('RES', response);
    const { error } = response;
    // if (!error) Router.replace('/overview');
    setError(error);
  };

  return (
    <Flex
      maxW={{ base: '100%', md: 'max-content' }}
      w='100%'
      mx={{ base: 'auto', lg: '0px' }}
      me='auto'
      justifyContent='center'
      px={{ base: '20px', md: '0px' }}
      flexDirection='column'
    >
      <Head>
        <title>Welcome to Apollo BTC</title>
      </Head>
      <Box me='auto'>
        <Heading color={textColor} fontSize='36px' mb='10px'>
          Sign In
        </Heading>
        <Text
          mb='86px'
          ms='4px'
          color={textColorSecondary}
          fontWeight='400'
          fontSize='md'
        >
          Enter your password to sign in!
        </Text>
      </Box>
      <Flex
        zIndex='2'
        direction='column'
        w={{ base: '100%', md: '420px' }}
        maxW='100%'
        background='transparent'
        borderRadius='15px'
        mx={{ base: 'auto', lg: 'unset' }}
        me='auto'
        mb={{ base: '20px', md: 'auto' }}
      >
        <form onSubmit={handleSignin}>
          <FormControl>
            <FormLabel
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              display='flex'
            >
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size='md'>
              <Input
                name='password'
                onChange={(e) => setPassword(e.target.value)}
                isRequired={true}
                fontSize='sm'
                placeholder='Min. 8 characters'
                mb='24px'
                size='lg'
                type={showPassword ? 'text' : 'password'}
                variant='auth'
              />
              <InputRightElement display='flex' alignItems='center' mt='4px'>
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: 'pointer' }}
                  as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleShowPassword}
                />
              </InputRightElement>
            </InputGroup>
            <Button
              type='submit'
              fontSize='sm'
              variant='brand'
              fontWeight='500'
              w='100%'
              h='50'
              mb='24px'
            >
              Sign In
            </Button>
          </FormControl>
        </form>
        {error && (
          <Flex align={'center'} direction='column'>
            <Text color='red'>{error}</Text>
          </Flex>
        )}
      </Flex>
      <Flex align={'center'} direction='column' mt='10'>
        <Text fontSize={'0.9em'}>© 2023 FutureBit LLC</Text>
      </Flex>
    </Flex>
  );
};

export default SignIn;
