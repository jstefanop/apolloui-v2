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

const SignIn = () => {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleSignin = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      password,
      callbackUrl: `${window.location.origin}/`,
      redirect: false,
    });
    console.log('RES', res);
  };

  return (
    <Flex
      maxW={{ base: '100%', md: 'max-content' }}
      w='100%'
      mx={{ base: 'auto', lg: '0px' }}
      me='auto'
      h='100%'
      alignItems='start'
      justifyContent='center'
      mb={{ base: '30px', md: '60px' }}
      px={{ base: '25px', md: '0px' }}
      mt={{ base: '40px', md: '14vh' }}
      flexDirection='column'
    >
      <Box me='auto'>
        <Heading color={textColor} fontSize='36px' mb='10px'>
          Sign In
        </Heading>
        <Text
          mb='36px'
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
      </Flex>
    </Flex>
  );
};

export default SignIn;
