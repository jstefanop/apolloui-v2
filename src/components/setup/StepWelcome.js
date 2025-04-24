// components/setup/StepWelcome.js
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useIntl } from 'react-intl';

const StepWelcome = ({ setStep }) => {
  const intl = useIntl();
  
  return (
    <Box mx="auto" py="150px">
      <Flex flexDir="column">
        <Text fontSize="4xl" fontWeight="700" lineHeight="8" color="white" mb="10">
          {intl.formatMessage({ id: 'setup.welcome.title' })}
          <br />
          {intl.formatMessage({ id: 'setup.welcome.subtitle' })}
        </Text>
        <Button
          fontSize="sm"
          bgColor="white"
          color="brand.800"
          fontWeight="500"
          w="300px"
          h="50"
          mb="24px"
          onClick={() => setStep(2)}
        >
          {intl.formatMessage({ id: 'setup.welcome.button' })}
        </Button>
      </Flex>
    </Box>
  );
};

export default StepWelcome;