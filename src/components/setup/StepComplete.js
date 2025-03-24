// components/setup/StepComplete.js
import { Box, Button, Flex, Text } from '@chakra-ui/react';

const StepComplete = ({ handleStartMining, loadingMinerRestart }) => (
  <Box mx="auto" py="150px">
    <Flex flexDir="column">
      <Text fontSize="4xl" fontWeight="700" lineHeight="9" color="white" mb="10">
        Your Setup is complete!
        <br />
        Let&apos;s start mining some Bitcoin!
      </Text>
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
        Start mining
      </Button>
    </Flex>
  </Box>
);

export default StepComplete;