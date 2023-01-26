// Chakra imports
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import GaugeChart from '../charts/GaugeCharts';

const NoCardStatisticsGauge = ({
  id,
  startContent,
  name,
  value,
  rawValue,
  total,
  gauge,
  ...props
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'secondaryGray.600';
  let percentage;
  let roundedPercentage;

  if (rawValue && total) {
    percentage = (rawValue / total) * 100;
    roundedPercentage = Math.round(percentage * 100) / 100;
  }

  const gaugeColor =
    roundedPercentage <= 30
      ? '#8bc34a'
      : roundedPercentage <= 70
      ? '#ffab00'
      : '#f44336';

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
      /*
      gradient: {
        inverseColors: true,
        gradientToColors: [gaugeColor],
        colorStops: [
          {
            offset: 0,
            color: '#f44336',
            opacity: 1,
          },
          {
            offset: 20,
            color: '#ffab00',
            opacity: 1,
          },
          {
            offset: 70,
            color: '#8bc34a',
            opacity: 1,
          },
          {
            offset: 100,
            color: '#fff',
            opacity: 1,
          },
        ],
      },
      */
    },
  };

  return (
    <Flex align="center" direction="column" w="100%">
      <Flex justify="space-between" align="start">
        <Flex flexDirection="column" align="start">
          {startContent}
        </Flex>
        <Flex align="center">
          <Stat my="auto" ms={startContent ? '8px' : '0px'}>
            <StatNumber
              color={textColor}
              fontSize={{
                base: '2xl',
              }}
            >
              {value}
            </StatNumber>
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
      {gauge && roundedPercentage && (
        <Box>
          <GaugeChart
            chartOptions={chartOptions}
            chartData={[roundedPercentage]}
          />
        </Box>
      )}
    </Flex>
  );
};

export default NoCardStatisticsGauge;
