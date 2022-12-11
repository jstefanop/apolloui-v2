// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Progress,
} from '@chakra-ui/react';
// Custom components
import Card from '../card/Card';
// Custom icons
import React from 'react';

const MicroStatistics = ({
  startContent,
  endContent,
  name,
  secondaryText,
  progress,
  progressColor,
  progressValue,
  value,
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('gray.200', 'secondaryGray.900');
  const textColorSecondary = 'secondaryGray.600';

  return (
    <Card py='12px' bg={bgColor}>
      <Flex
        my='auto'
        h='100%'
        align={{ base: 'center', xl: 'start' }}
        justify={{ base: 'center', xl: 'center' }}
      >
        {startContent}

        <Stat my='auto' ms={startContent ? '18px' : '0px'}>
          <StatLabel
            lineHeight='100%'
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name}
          </StatLabel>
          <StatNumber
            color={textColor}
            fontSize={{
              base: '1.5xl',
            }}
          >
            {value}
          </StatNumber>
        </Stat>
        <Flex ms='auto' w='max-content'>
          {endContent}
        </Flex>
      </Flex>
    </Card>
  );
};

export default MicroStatistics;
