import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import moment from '../../lib/moment';
import { displayHashrate } from '../../lib/utils';
import { useTheme, useColorModeValue, Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useSoloAnalyticsData } from '../../hooks/useSoloAnalyticsData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * HashrateChart component - displays hashrate data over time
 * @param {Object} props
 * @param {Array} props.dataAnalytics - Analytics data array
 * @param {boolean} props.loading - Loading state
 * @param {string} props.source - Data source: 'miner' (default) or 'solo'
 */
const HashrateChart = React.memo(({ dataAnalytics, loading = false, source = 'miner' }) => {
  const theme = useTheme();
  const isSolo = source === 'solo';

  const gridColor = useColorModeValue(theme.colors.secondaryGray[400], theme.colors.secondaryGray[900]);
  const textColor = useColorModeValue(theme.colors.secondaryGray[700], theme.colors.secondaryGray[700]);
  
  // Miner colors
  const minerColor = useColorModeValue(theme.colors.blue[500], theme.colors.blue[500]);
  const poolColor = useColorModeValue(theme.colors.brand[600], theme.colors.brand[600]);
  
  // Solo colors - using orange/amber tones to differentiate
  const soloHashrateColor = useColorModeValue(theme.colors.orange[500], theme.colors.orange[400]);
  const soloWorkersColor = useColorModeValue(theme.colors.teal[500], theme.colors.teal[400]);
  
  // Pre-compute color values for animations to avoid calling hooks in callbacks
  const progressBgColor = useColorModeValue('gray.200', 'gray.600');
  const progressGradientStart = useColorModeValue(isSolo ? '#dd6b20' : '#3182ce', isSolo ? '#ed8936' : '#63b3ed');
  const progressGradientEnd = useColorModeValue(isSolo ? '#ed8936' : '#63b3ed', isSolo ? '#f6ad55' : '#90cdf4');
  const loadingBgColor = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)');
  const loadingTextColor = useColorModeValue('gray.600', 'gray.300');

  // Use the appropriate analytics data hook based on source
  const minerAnalytics = useAnalyticsData(isSolo ? null : dataAnalytics);
  const soloAnalytics = useSoloAnalyticsData(isSolo ? dataAnalytics : null);
  
  const { data: limitedData, chartData } = isSolo ? soloAnalytics : minerAnalytics;

  // Format labels for display
  const labels = useMemo(() => 
    limitedData.map((item) => moment(item.date).startOf('hour').format('HH:mm')),
    [limitedData]
  );

  // Get colors and series names based on source
  const primaryColor = isSolo ? soloHashrateColor : minerColor;
  const secondaryColor = isSolo ? soloWorkersColor : poolColor;
  const primarySeriesName = isSolo ? 'Solo Hashrate' : 'Miner';
  const secondarySeriesName = isSolo ? 'Workers' : 'Pool';

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
    yaxis: isSolo ? [
      {
        title: {
          text: 'Hashrate',
          style: {
            color: primaryColor
          }
        },
        labels: {
          formatter: (value) => displayHashrate(value, 'GH/s', true, 2),
          style: {
            colors: textColor
          }
        },
        min: 0
      }
    ] : {
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
          if (isSolo) {
            return seriesIndex === 0 
              ? displayHashrate(value, 'GH/s', true, 2)
              : `${value} workers`;
          }
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
    colors: [primaryColor, secondaryColor],
    markers: {
      size: 4,
      hover: {
        size: 8
      },
      fillColors: [primaryColor, secondaryColor],
      strokeColors: [primaryColor, secondaryColor],
      strokeWidth: 2,
      strokeOpacity: 0.8,
      fillOpacity: 0.8
    }
  }), [labels, gridColor, textColor, primaryColor, secondaryColor, isSolo]);

  // Memoize series data
  const series = useMemo(() => {
    if (isSolo) {
      return [
        {
          name: primarySeriesName,
          data: chartData.hashrates
        }
      ];
    }
    return [
      {
        name: primarySeriesName,
        data: chartData.hashrates
      },
      {
        name: secondarySeriesName,
        data: chartData.poolhashrates
      }
    ];
  }, [chartData.hashrates, chartData.poolhashrates, isSolo, primarySeriesName, secondarySeriesName]);

  // Show loader when no data available
  if (!limitedData.length) {
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
                bg={progressBgColor}
                borderRadius="full"
                overflow="hidden"
                position="relative"
              >
                <Box
                  w="40%"
                  h="100%"
                  bg={`linear-gradient(90deg, ${progressGradientStart}, ${progressGradientEnd})`}
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
            {loading ? 'Loading data...' : 'Waiting for data...'}
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
          bg={loadingBgColor}
          px={2}
          py={1}
          borderRadius="md"
          boxShadow="sm"
        >
          <Spinner size="sm" color="blue.500" />
          <Text fontSize="xs" color={loadingTextColor}>
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