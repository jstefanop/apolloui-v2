import React from 'react';

// Chakra imports
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

// Custom components
import Card from '../card/Card.js';

const CardContent = () => {
  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgCard = useColorModeValue('white', 'navy.700');
  let paid = 0;
  let total = 0;
  return (
    <Flex direction="column" p={{ base: '10px', md: '60px' }}>
      <Card
        bg={bgCard}
        p="30px"
        mb="30px"
        mt="-100px"
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Flex direction="column" me="auto" mb={{ base: '30px', md: '0px' }}>
            <Text
              w="max-content"
              mb="8px"
              fontSize="md"
              color="secondaryGray.600"
              fontWeight="400"
            >
              Invoice for:
            </Text>
          </Flex>
        </Flex>
      </Card>
      <Flex mt="70px" direction={{ base: 'column', md: 'row' }}>
        <Box me="auto" mb={{ base: '40px', md: '0px' }}>
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            Note
          </Text>
          <Text
            fontSize="md"
            fontWeight="400"
            color="secondaryGray.600"
            maxW="292px"
          >
            Hi Anthony, please take a look at the this invoice from September.
            Let me know if you have any questions, thanks.
          </Text>
        </Box>
        <Box>
          <Flex align="center" justifyContent="space-between" mb="12px">
            <Text
              textAlign="end"
              color={textColor}
              fontSize="lg"
              fontWeight="400"
            >
              Total
            </Text>
            <Text color={textColor} fontSize="lg" fontWeight="700" maxW="292px">
              ${345}
            </Text>
          </Flex>
          <Flex align="center" justifyContent="space-between">
            <Text
              me="70px"
              fontWeight="400"
              textAlign="end"
              color={textColor}
              fontSize="lg"
            >
              Paid to date
            </Text>
            <Text color={textColor} fontSize="lg" fontWeight="700" maxW="292px">
              ${paid}
            </Text>
          </Flex>
          
          <Flex align="center" justifyContent="space-between">
            <Text
              me="70px"
              fontWeight="400"
              textAlign="end"
              color={textColor}
              fontSize="lg"
            >
              Amount to pay
            </Text>
            <Text color={textColor} fontSize="lg" fontWeight="700" maxW="292px">
              ${total - paid}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}

export default CardContent;