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
  Tooltip,
  Button,
} from '@chakra-ui/react';
// Custom components
import Card from '../card/Card';
// Custom icons
import React, { useEffect, useState } from 'react';

const MiniStatistics = ({
  bgColor,
  startContent,
  endContent,
  reversed,
  name,
  secondaryText,
  secondaryDescription,
  progress,
  progressColor,
  progressValue,
  progressTotal,
  progressPercent,
  fontSize,
  value,
  button,
  buttonHandler,
  buttonIcon,
  ...props
}) => {
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  const [roundedPercentage, setRoundedPercentage] = useState(progressPercent);

  useEffect(() => {
    if (progressValue && progressTotal) {
      const percentage = (progressValue / progressTotal) * 100;
      setRoundedPercentage(Math.round(percentage * 100) / 100);
    }
    if (progressPercent) setRoundedPercentage(progressPercent);
  }, [progressValue, progressTotal, progressPercent]);

  return (
    <Card py="15px" bg={bgColor} shadow={shadow} {...props}>
      <Flex justify={{ base: 'center', xl: 'center' }}>
        {startContent}

        <Tooltip
          hasArrow
          bg={'gray.600'}
          color="white"
          placement="top"
          label={value}
        >
          <Stat ms={startContent ? '18px' : '0px'}>
            {reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
                noOfLines={1}
                maxWidth={{ base: '300px', xl: '300px' }}
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
              noOfLines={1}
            >
              {name}
            </StatLabel>
            {!reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
                noOfLines={1}
              >
                {value}
              </StatNumber>
            )}
            {secondaryText ? (
              <StatNumber fontWeight={600} fontSize="md" mt="3">
                {secondaryText}
              </StatNumber>
            ) : null}
            {secondaryDescription ? (
              <StatLabel
                color={textColorSecondary}
                fontSize={{
                  base: 'sm',
                }}
                noOfLines={1}
              >
                {secondaryDescription}
              </StatLabel>
            ) : null}
          </Stat>
        </Tooltip>
        {button && (
          <Flex align="center" ms="18px" >
            <Button leftIcon={buttonIcon} onClick={buttonHandler} size="sm">{button}</Button>
          </Flex>
        )}
        {endContent && (
          <Flex ms="auto" w="max-content">
            {endContent}
          </Flex>
        )}
      </Flex>
      {progress && (
        <Flex align="center" mt="5">
          <Progress
            variant="table"
            colorScheme={progressColor || 'brandScheme'}
            h="6px"
            w="100%"
            value={roundedPercentage}
          />
        </Flex>
      )}
    </Card>
  );
};

export default MiniStatistics;
