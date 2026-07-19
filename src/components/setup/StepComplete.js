// components/setup/StepComplete.js
import { Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';

const StepComplete = ({
  handleStartMining,
  loadingMinerRestart,
  loadingNodeStart,
  isSoloNode,
  error,
}) => {
  const intl = useIntl();
  const textColor = useColorModeValue('white', 'white');
  const buttonColor = useColorModeValue('gray.400', 'brand.300');
  const isLoading =
    loadingNodeStart || (!isSoloNode && loadingMinerRestart);

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
        >
          {isSoloNode 
            ? intl.formatMessage({ id: 'setup.complete.button_solo' }) 
            : intl.formatMessage({ id: 'setup.complete.button' })}
        </Button>
        {error && <Text color="red.300">{error}</Text>}
      </Flex>
    </Box>
  );
};

export default StepComplete;