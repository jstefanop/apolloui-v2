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
import { useEffect, useState } from 'react';
import { percentColor } from '../../lib/utils';
import GaugeChart from '../charts/GaugeCharts';
import ChartLoader from './Loaders/ChartLoader';
import { ErrorIcon } from '../UI/Icons/ErrorIcon';

const NoCardStatisticsGauge = ({
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
  const [roundedPercentage, setRoundedPercentage] = useState(percent);
  const isOnError = error && error.length > 0;

  useEffect(() => {
    if (rawValue && total) {
      const percentage = (rawValue / total) * 100;
      const valuePerc = Math.round(percentage * 100) / 100;
      setRoundedPercentage(valuePerc.toFixed(2));
    }
    if (percent) setRoundedPercentage(percent.toFixed(2));
  }, [rawValue, total, percent]);
  
  const gaugeColor = percentColor(roundedPercentage);

  const chartOptions = {
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#a3aed0',
          strokeWidth: '20%',
          opacity: 0.3,
          dropShadow: {
            enabled: true,
            blur: 3,
            opacity: 0.25,
          },
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '14px',
            color: '#a3aed0',
            formatter: function (val) {
              return legendValue || `${val}%`;
            },
          },
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
    colors: [gaugeColor],
    fill: {
      type: 'solid',
      opacity: '1',
    },
  };

  return (
    <Flex
      align={align || 'center'}
      direction={{ base: 'row', md: 'column' }}
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
                  {!isOnError && (value || roundedPercentage) ? (
                    <StatNumber
                      color={textColor}
                      fontSize={{
                        base: '2xl',
                      }}
                      noOfLines={1}
                    >
                      {value || `${roundedPercentage}%` || 'N.a.'}
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
          {!isOnError && gauge && roundedPercentage && (
            <Box>
              <GaugeChart
                chartOptions={chartOptions}
                chartData={[roundedPercentage]}
                id={id}
              />
            </Box>
          )}
        </>
      )}
    </Flex>
  );
};

export default NoCardStatisticsGauge;
