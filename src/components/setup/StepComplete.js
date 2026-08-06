// components/setup/StepComplete.js
import { Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

const StepComplete = ({ handleStartMining, loadingMinerRestart, loadingSoloRestart, loadingNodeStart, isSoloNode }) => {
  const intl = useIntl();
  const router = useRouter();
  const textColor = useColorModeValue('white', 'white');
  const buttonColor = useColorModeValue('gray.400', 'brand.300');

  const handleGoToLogin = () => {
    router.push('/signin');
  };

  // Which calls handleStartMining makes depends on the chassis and the mining
  // mode picked, so watch all three: keying this off the device type left gaps
  // where the button went live again between two awaited restarts.
  const isLoading = loadingNodeStart || loadingMinerRestart || loadingSoloRestart;

  return (
    <Box mx="auto" py="150px">
      <Flex flexDir="column">
        <Text fontSize="4xl" fontWeight="700" lineHeight="9" color={textColor} mb="10">
          {intl.formatMessage({ id: 'setup.complete.title' })}
          {!isSoloNode && (
            <>
              <br />
              {intl.formatMessage({ id: 'setup.complete.subtitle' })}
            </>
          )}
        </Text>
        <Button
          fontSize="sm"
          bg={buttonColor}
          fontWeight="500"
          w="300px"
          h="50"
          mb="24px"
          onClick={handleStartMining}
          isDisabled={isLoading}
          isLoading={isLoading}
          loadingText={intl.formatMessage({ id: 'setup.complete.warming_up' })}
        >
          {isSoloNode 
            ? intl.formatMessage({ id: 'setup.complete.button_solo' }) 
            : intl.formatMessage({ id: 'setup.complete.button' })}
        </Button>
      </Flex>
    </Box>
  );
};

export default StepComplete;