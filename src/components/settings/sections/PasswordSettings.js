import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Input,
  Button,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLazyQuery } from '@apollo/client';
import { KeyIcon } from '../../UI/Icons/KeyIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { CHANGE_PASSWORD_QUERY } from '../../../graphql/auth';
import { useSettings } from '../context/SettingsContext';

const PasswordSettings = () => {
  const { setIsChanged } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

  const [lockPassword, setLockPassword] = useState('');
  const [verifyLockpassword, setVerifyLockPassword] = useState('');
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [isLockpasswordError, setIsLockpasswordError] = useState(false);

  const [
    changeLockPassword,
    { loading: changeLockPasswordLoading, error: errorChangeLockPassword },
  ] = useLazyQuery(CHANGE_PASSWORD_QUERY, { fetchPolicy: 'no-cache' });

  // Validate passwords
  useEffect(() => {
    if (!lockPassword || !verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(false);
    } else if (lockPassword.length < 8) {
      setIsLockpasswordError('The password must have 8 characters at least');
      setIsChanged(false);
    } else if (lockPassword === verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(true);
    } else {
      setIsLockpasswordError('Passwords must match');
      setIsChanged(false);
    }
  }, [lockPassword, verifyLockpassword, setIsChanged]);

  // Handle password change
  const handleSavePassword = () => {
    if (lockPassword && verifyLockpassword && lockPassword === verifyLockpassword) {
      changeLockPassword({
        variables: { input: { password: lockPassword } },
      });
      setIsChanged(false);
    }
  };

  return (
    <PanelCard
      title={'Lockscreen'}
      description={'Change the password to access the dashboard'}
      textColor={textColor}
      icon={KeyIcon}
      mb="20px"
    >
      <SimpleCard textColor={textColor}>
        <form onSubmit={handleSavePassword}>
          <Flex flexDir={'column'}>
            <FormControl isRequired>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  color={inputTextColor}
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Your lock screen password"
                  mb="24px"
                  size="lg"
                  type={showLockPassword ? 'text' : 'password'}
                  id="password"
                  onChange={(e) => setLockPassword(e.target.value)}
                  isInvalid={isLockpasswordError}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() =>
                      setShowLockPassword(!showLockPassword)
                    }
                  >
                    {showLockPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Verify Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  color={inputTextColor}
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Verify your lock screen password"
                  mb="24px"
                  size="lg"
                  type={showLockPassword ? 'text' : 'password'}
                  id="verifypassword"
                  onChange={(e) =>
                    setVerifyLockPassword(e.target.value)
                  }
                  isInvalid={isLockpasswordError}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() =>
                      setShowLockPassword(!showLockPassword)
                    }
                  >
                    {showLockPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {isLockpasswordError && (
                <Text fontSize={'sm'} color={'red'}>
                  {isLockpasswordError}
                </Text>
              )}
            </FormControl>
          </Flex>
        </form>
      </SimpleCard>
    </PanelCard>
  );
};

export default PasswordSettings;