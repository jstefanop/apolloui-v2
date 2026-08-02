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
  Skeleton,
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
  // Draw the card, skeleton only the value. The label and icon are known before
  // any data arrives, so showing them says WHAT is loading — and a single-line
  // value keeps its size, so nothing shifts when the number lands. A caller
  // passing a multi-line element as `value` still grows by the extra lines.
  loading,
  ...props
}) => {
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  const [roundedPercentage, setRoundedPercentage] = useState(progressPercent);

  // Check if value is a React element (not just a string/number)
  const isComplexValue = React.isValidElement(value);

  // The skeleton renders inside StatNumber, so a non-breaking space sizes it to
  // exactly one line of the value it stands in for — at whatever fontSize the
  // caller passed. A fixed pixel height cannot be right for both `md` and `2xl`.
  const shownValue = loading ? (
    <Skeleton width="70%" borderRadius="6px">
      &nbsp;
    </Skeleton>
  ) : (
    value
  );

  useEffect(() => {
    if (progressValue && progressTotal) {
      const percentage = (progressValue / progressTotal) * 100;
      setRoundedPercentage(Math.round(percentage * 100) / 100);
    }
    if (progressPercent) setRoundedPercentage(progressPercent);
  }, [progressValue, progressTotal, progressPercent]);

  return (
    <Card py="15px" bg={bgColor} shadow={shadow} {...props}>
      <Flex justify={{ base: 'center', xl: 'center' }} w="100%">
        {startContent}

          <Stat 
            ms={startContent ? '18px' : '0px'} 
            flex="1"
            minW="0"
          >
            {reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
                noOfLines={isComplexValue ? undefined : 1}
                maxW={isComplexValue ? undefined : "100%"}
                overflow={isComplexValue ? "visible" : "hidden"}
                textOverflow={isComplexValue ? undefined : "ellipsis"}
                whiteSpace={isComplexValue ? "normal" : "nowrap"}
              >
                {shownValue}
              </StatNumber>
            )}
            <StatLabel
              lineHeight="100%"
              color={textColorSecondary}
              fontSize={{
                base: 'sm',
              }}
              noOfLines={1}
              maxW="100%"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {name}
            </StatLabel>
            {!reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
                noOfLines={isComplexValue ? undefined : 1}
                maxW={isComplexValue ? undefined : "100%"}
                overflow={isComplexValue ? "visible" : "hidden"}
                textOverflow={isComplexValue ? undefined : "ellipsis"}
                whiteSpace={isComplexValue ? "normal" : "nowrap"}
              >
                {shownValue}
              </StatNumber>
            )}
            {secondaryText ? (
              <StatNumber fontWeight={600} fontSize="md" mt="3">
                {loading ? (
                  <Skeleton width="50%" borderRadius="6px">
                    &nbsp;
                  </Skeleton>
                ) : (
                  secondaryText
                )}
              </StatNumber>
            ) : null}
            {secondaryDescription ? (
              <StatLabel
                color={textColorSecondary}
                fontSize={{
                  base: 'sm',
                }}
                noOfLines={1}
                maxW="100%"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {secondaryDescription}
              </StatLabel>
            ) : null}
          </Stat>

        {button && (
          <Flex align="center" ms="18px" flexShrink="0">
            <Button leftIcon={buttonIcon} onClick={buttonHandler} size="sm">{button}</Button>
          </Flex>
        )}
        {endContent && (
          <Flex ms="auto" w="max-content" flexShrink="0">
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
