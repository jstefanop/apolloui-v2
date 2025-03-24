// components/setup/StepWelcome.js
import { Box, Button, Flex, Text } from '@chakra-ui/react';

const StepWelcome = ({ setStep }) => (
  <Box mx="auto" py="150px">
    <Flex flexDir="column">
      <Text fontSize="4xl" fontWeight="700" lineHeight="8" color="white" mb="10">
        One node. One miner. One person.
        <br />
        Welcome.
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
        Start setup process
      </Button>
    </Flex>
  </Box>
);

export default StepWelcome;