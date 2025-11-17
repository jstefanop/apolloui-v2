// components/setup/StepComplete.js
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

const StepComplete = ({ handleStartMining, loadingMinerRestart, isSoloNode }) => {
  const intl = useIntl();
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/signin');
  };

  return (
    <Box mx="auto" py="150px">
      <Flex flexDir="column">
        <Text fontSize="4xl" fontWeight="700" lineHeight="9" color="white" mb="10">
          {intl.formatMessage({ id: 'setup.complete.title' })}
          {!isSoloNode && (
            <>
              <br />
              {intl.formatMessage({ id: 'setup.complete.subtitle' })}
            </>
          )}
        </Text>
        {!isSoloNode && (
          <Button
            fontSize="sm"
            bgColor="white"
            color="brand.800"
            fontWeight="500"
            w="300px"
            h="50"
            mb="24px"
            onClick={handleStartMining}
            isDisabled={loadingMinerRestart}
            isLoading={loadingMinerRestart}
          >
            {intl.formatMessage({ id: 'setup.complete.button' })}
          </Button>
        )}
        {isSoloNode && (
          <Button
            fontSize="sm"
            bgColor="white"
            color="brand.800"
            fontWeight="500"
            w="300px"
            h="50"
            mb="24px"
            onClick={handleGoToLogin}
          >
            {intl.formatMessage({ id: 'signin.button' })}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default StepComplete;