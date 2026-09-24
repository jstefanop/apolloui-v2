// Chakra imports
import {
  Box,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { percentColor } from '../../lib/utils';
import GaugeArc from '../charts/GaugeArc';
import ChartLoader from './Loaders/ChartLoader';
import { ErrorIcon } from '../UI/Icons/ErrorIcon';

const NoCardStatisticsGauge = React.memo(({
  id,
  startContent,
  name,
  value,
  secondaryValue,
  legendValue,
  rawValue,
  percent,
  total,
  gauge,
  align,
  loading,
  error,
  ...props
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const [roundedPercentage, setRoundedPercentage] = useState(percent !== null && percent !== undefined ? percent.toFixed(2) : null);
  const isOnError = error && error.length > 0;

  // Check if value is a React element (not just a string/number)
  const isComplexValue = React.isValidElement(value);

  useEffect(() => {
    if (rawValue && total) {
      const percentage = (rawValue / total) * 100;
      const valuePerc = Math.round(percentage * 100) / 100;
      setRoundedPercentage(valuePerc.toFixed(2));
    }
    if (percent !== null && percent !== undefined) {
      setRoundedPercentage(percent.toFixed(2));
    }
  }, [rawValue, total, percent]);

  const gaugeColor = percentColor(roundedPercentage);




  return (
    <Flex
      align={align || 'center'}
      direction={{ base: 'column' }}
      w="100%"
    >
      {loading ? (
        <ChartLoader />
      ) : (
        <>
          <Flex justify="space-between">
            <Flex flexDirection="column">{startContent}</Flex>
            <Flex align="center">
              <Stat my="auto" ms={startContent ? '8px' : '0px'}>
                <Flex direction={'row'}>
                  {!isOnError && (value || (roundedPercentage !== null && roundedPercentage !== undefined)) ? (
                    <StatNumber
                      color={textColor}
                      fontSize={{
                        base: '2xl',
                      }}
                      noOfLines={isComplexValue ? undefined : 1}
                      overflow={isComplexValue ? "visible" : undefined}
                      whiteSpace={isComplexValue ? "normal" : undefined}
                    >
                      {value
                        ? value
                        : roundedPercentage !== null && roundedPercentage !== undefined
                        ? `${roundedPercentage}%`
                        : 'N.a.'}
                    </StatNumber>
                  ) : (
                    <Text color={textColor} fontSize={'xs'}>
                      <Icon as={ErrorIcon} color={'red'} /> Can&apos;t get data
                    </Text>
                  )}
                  {secondaryValue && (
                    <StatNumber
                      color={textColorSecondary}
                      fontSize={{
                        base: 'md',
                      }}
                      alignSelf="center"
                      ml="2"
                    >
                      {secondaryValue || 'n.a.'}
                    </StatNumber>
                  )}
                </Flex>
                <StatLabel
                  lineHeight="100%"
                  color={textColorSecondary}
                  fontSize={{
                    base: 'sm',
                  }}
                >
                  {name}
                </StatLabel>
              </Stat>
            </Flex>
          </Flex>
          {!isOnError && gauge && roundedPercentage !== null && roundedPercentage !== undefined && (
            <Box>
              <GaugeArc
                percent={parseFloat(roundedPercentage) || 0}
                color={gaugeColor}
                label={legendValue}
                id={id}
              />
            </Box>
          )}
        </>
      )}
    </Flex>
  );
});

NoCardStatisticsGauge.displayName = 'NoCardStatisticsGauge';

export default NoCardStatisticsGauge;
