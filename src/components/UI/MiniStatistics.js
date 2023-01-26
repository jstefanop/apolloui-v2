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

const MiniStatistics = ({
  bgColor,
  startContent,
  endContent,
  reversed,
  name,
  secondaryText,
  progress,
  progressColor,
  progressValue,
  value,
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'secondaryGray.600';

  return (
    <Card py="15px" bg={bgColor}>
      <Flex
        my="auto"
        h="100%"
        align={{ base: 'center', xl: 'start' }}
        justify={{ base: 'center', xl: 'center' }}
      >
        {startContent}

        <Stat my="auto" ms={startContent ? '18px' : '0px'}>
          {reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: '2xl',
              }}
            >
              {value}
            </StatNumber>
          )}
          <StatLabel
            lineHeight="100%"
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name}
          </StatLabel>
          {!reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: '2xl',
              }}
            >
              {value}
            </StatNumber>
          )}
          {secondaryText ? <Flex align="center">{secondaryText}</Flex> : null}
          {progress && (
            <Flex align="center" mt="8px">
              <Progress
                variant="table"
                colorScheme={progressColor || 'brandScheme'}
                h="6px"
                w="100%"
                value={progressValue}
              />
            </Flex>
          )}
        </Stat>
        <Flex ms="auto" w="max-content">
          {endContent}
        </Flex>
      </Flex>
    </Card>
  );
};

export default MiniStatistics;
