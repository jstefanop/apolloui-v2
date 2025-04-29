import React from 'react';
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
import { useIntl } from 'react-intl';
import { KeyIcon } from '../../UI/Icons/KeyIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { usePasswordSettings } from '../hooks/usePasswordSettings';

const PasswordSettings = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

  const {
    lockPassword,
    setLockPassword,
    verifyLockpassword,
    setVerifyLockPassword,
    showLockPassword,
    setShowLockPassword,
    isLockpasswordError
  } = usePasswordSettings();

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.system.password.title' })}
      description={intl.formatMessage({ id: 'settings.sections.system.password.description' })}
      textColor={textColor}
      icon={KeyIcon}
      mb="20px"
    >
      <SimpleCard textColor={textColor}>
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
              {intl.formatMessage({ id: 'settings.sections.system.password.password' })}
            </FormLabel>
            <InputGroup size="md">
              <Input
                color={inputTextColor}
                isRequired={true}
                fontSize="sm"
                placeholder={intl.formatMessage({ id: 'settings.sections.system.password.password_placeholder' })}
                mb="24px"
                size="lg"
                type={showLockPassword ? 'text' : 'password'}
                id="password"
                value={lockPassword}
                onChange={(e) => setLockPassword(e.target.value)}
                isInvalid={!!isLockpasswordError}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowLockPassword(!showLockPassword)}
                >
                  {showLockPassword ? intl.formatMessage({ id: 'settings.sections.system.password.hide' }) : intl.formatMessage({ id: 'settings.sections.system.password.show' })}
                </Button>
              </InputRightElement>
            </InputGroup>
            {isLockpasswordError && (
              <Text fontSize={'sm'} color={'red.500'} mb="24px">
                {isLockpasswordError}
              </Text>
            )}
          </FormControl>
          <FormControl isRequired>
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              {intl.formatMessage({ id: 'settings.sections.system.password.verify_password' })}
            </FormLabel>
            <InputGroup size="md">
              <Input
                color={inputTextColor}
                isRequired={true}
                fontSize="sm"
                placeholder={intl.formatMessage({ id: 'settings.sections.system.password.verify_password_placeholder' })}
                mb="24px"
                size="lg"
                type={showLockPassword ? 'text' : 'password'}
                id="verifypassword"
                value={verifyLockpassword}
                onChange={(e) => setVerifyLockPassword(e.target.value)}
                isInvalid={!!isLockpasswordError}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowLockPassword(!showLockPassword)}
                >
                  {showLockPassword ? intl.formatMessage({ id: 'settings.sections.system.password.hide' }) : intl.formatMessage({ id: 'settings.sections.system.password.show' })}
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
      </SimpleCard>
    </PanelCard>
  );
};

export default PasswordSettings;