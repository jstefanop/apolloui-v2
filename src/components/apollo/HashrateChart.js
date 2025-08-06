import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import moment from '../../lib/moment';
import { displayHashrate } from '../../lib/utils';
import { useTheme, useColorModeValue, Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const HashrateChart = React.memo(({ dataAnalytics, loading = false }) => {
  const theme = useTheme();

  const gridColor = useColorModeValue(theme.colors.secondaryGray[400], theme.colors.secondaryGray[900]);
  const textColor = useColorModeValue(theme.colors.secondaryGray[700], theme.colors.secondaryGray[700]);
  const minerColor = useColorModeValue(theme.colors.blue[500], theme.colors.blue[500]);
  const poolColor = useColorModeValue(theme.colors.brand[600], theme.colors.brand[600]);

  // Use the optimized analytics data hook
  const { data: limitedData, chartData } = useAnalyticsData(dataAnalytics);

  // Format labels for display
  const labels = useMemo(() => 
    limitedData.map((item) => moment(item.date).startOf('hour').format('HH:mm')),
    [limitedData]
  );

  // Memoize chart options to prevent unnecessary re-renders
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      zoom: {
        enabled: false
      },
      // Add redraw options to optimize performance
      redrawOnWindowResize: false,
      redrawOnParentResize: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: textColor
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => displayHashrate(value, 'GH/s', true, 2),
        style: {
          colors: textColor
        }
      },
      min: 0
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'HH:mm'
      },
      y: {
        formatter: (value, { seriesIndex }) => {
          const label = seriesIndex === 0 ? 'Miner' : 'Pool';
          return `${label} ${displayHashrate(value, 'GH/s', true, 2)}`;
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: textColor
      }
    },
    colors: [minerColor, poolColor],
    markers: {
      size: 4,
      hover: {
        size: 8
      },
      fillColors: [minerColor, poolColor],
      strokeColors: [minerColor, poolColor],
      strokeWidth: 2,
      strokeOpacity: 0.8,
      fillOpacity: 0.8
    }
  }), [labels, gridColor, textColor, minerColor, poolColor]);

  // Memoize series data
  const series = useMemo(() => [
    {
      name: 'Miner',
      data: chartData.hashrates
    },
    {
      name: 'Pool',
      data: chartData.poolhashrates
    }
  ], [chartData.hashrates, chartData.poolhashrates]);

  // Show loader only if no data available and not loading
  if (!limitedData.length && !loading) {
    return (
      <Box w="100%" h="300px" p="20px">
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          h="100%"
          gap={4}
        >
          <Box 
            w="240px" 
            h="60px" 
            position="relative"
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {/* Multiple animated progress lines */}
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                w="100%"
                h="3px"
                bg={useColorModeValue('gray.200', 'gray.600')}
                borderRadius="full"
                overflow="hidden"
                position="relative"
              >
                <Box
                  w="40%"
                  h="100%"
                  bg={`linear-gradient(90deg, ${useColorModeValue('#3182ce', '#63b3ed')}, ${useColorModeValue('#63b3ed', '#90cdf4')})`}
                  borderRadius="full"
                  position="absolute"
                  top="0"
                  left="0"
                  animation={`progressPulse${index} ${1.5 + index * 0.3}s ease-in-out infinite`}
                  sx={{
                    [`@keyframes progressPulse${index}`]: {
                      '0%': {
                        left: '-40%',
                        opacity: 0.6
                      },
                      '50%': {
                        opacity: 1
                      },
                      '100%': {
                        left: '100%',
                        opacity: 0.6
                      }
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
          <Text fontSize="sm" color={textColor} mt={2}>
            Waiting for data...
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box w="100%" h="300px" p="20px" position="relative">
      {loading && (
        <Flex
          position="absolute"
          top="10px"
          right="10px"
          zIndex={10}
          align="center"
          gap={2}
          bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)')}
          px={2}
          py={1}
          borderRadius="md"
          boxShadow="sm"
        >
          <Spinner size="sm" color="blue.500" />
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
            {limitedData.length > 0 ? 'Updating...' : 'Loading...'}
          </Text>
        </Flex>
      )}
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="line"
        height="100%"
        width="100%"
      />
    </Box>
  );
});

HashrateChart.displayName = 'HashrateChart';

export default HashrateChart;