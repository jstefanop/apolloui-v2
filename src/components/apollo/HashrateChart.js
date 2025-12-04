import React, { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import moment from '../../lib/moment';
import { displayHashrate } from '../../lib/utils';
import { 
  useTheme, 
  useColorModeValue, 
  Box, 
  Flex, 
  Spinner, 
  Text,
  HStack
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useSoloAnalyticsData } from '../../hooks/useSoloAnalyticsData';
import { GET_ANALYTICS_QUERY, GET_SOLO_ANALYTICS_QUERY } from '../../graphql/analytics';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Interval configuration
export const INTERVAL_CONFIG = {
  tenmin: {
    points: 36,
    labelFormat: 'HH:mm',
    tooltipFormat: 'HH:mm',
    labelKey: 'chart.interval.6hours',
    defaultLabel: 'Last 6 hours'
  },
  hour: {
    points: 24,
    labelFormat: 'HH:mm',
    tooltipFormat: 'HH:mm',
    labelKey: 'chart.interval.24hours',
    defaultLabel: 'Last 24 hours'
  },
  day: {
    points: 30,
    labelFormat: 'DD MMM',
    tooltipFormat: 'DD MMM YYYY',
    labelKey: 'chart.interval.30days',
    defaultLabel: 'Last 30 days'
  }
};

/**
 * HashrateChart component - displays hashrate data over time
 * @param {Object} props
 * @param {string} props.source - Data source: 'miner' (default) or 'solo'
 * @param {string} props.interval - Selected interval: 'tenmin', 'hour', 'day' (default: 'hour')
 */
const HashrateChart = React.memo(({ 
  source = 'miner',
  interval = 'hour'
}) => {
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

  // Query for miner analytics
  const { 
    loading: loadingMinerQuery, 
    data: dataMinerQuery 
  } = useQuery(GET_ANALYTICS_QUERY, {
    variables: {
      input: {
        interval: interval,
      },
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    pollInterval: interval === 'tenmin' ? 30000 : 60000,
    skip: isSolo
  });

  // Query for solo analytics
  const { 
    loading: loadingSoloQuery, 
    data: dataSoloQuery 
  } = useQuery(GET_SOLO_ANALYTICS_QUERY, {
    variables: {
      input: {
        interval: interval,
        source: 'solo',
      },
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    pollInterval: interval === 'tenmin' ? 30000 : 60000,
    skip: !isSolo
  });

  // Extract miner data from query result
  const minerQueryData = useMemo(() => {
    if (!dataMinerQuery?.TimeSeries?.stats?.result?.data) return null;
    return dataMinerQuery.TimeSeries.stats.result.data;
  }, [dataMinerQuery]);

  // Extract solo data from query result
  const soloQueryData = useMemo(() => {
    if (!dataSoloQuery?.TimeSeries?.stats?.result?.data) return null;
    return dataSoloQuery.TimeSeries.stats.result.data;
  }, [dataSoloQuery]);

  // Get current interval config
  const currentConfig = INTERVAL_CONFIG[interval];

  // Use the appropriate analytics data hook based on source
  const minerAnalytics = useAnalyticsData(isSolo ? null : minerQueryData);
  const soloAnalytics = useSoloAnalyticsData(isSolo ? soloQueryData : null);
  
  // Select the appropriate data based on source
  const effectiveLoading = isSolo ? loadingSoloQuery : loadingMinerQuery;
  const { data: rawLimitedData, chartData } = isSolo ? soloAnalytics : minerAnalytics;

  // Limit data based on interval configuration
  const limitedData = useMemo(() => {
    if (!rawLimitedData || !rawLimitedData.length) return [];
    return rawLimitedData.slice(-currentConfig.points);
  }, [rawLimitedData, currentConfig.points]);

  // Format labels for display based on interval
  const labels = useMemo(() => {
    return limitedData.map((item) => {
      const date = moment(item.date);
      if (interval === 'day') {
        return date.format('DD MMM');
      }
      // For tenmin and hour, show time
      return date.format('HH:mm');
    });
  }, [limitedData, interval]);

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
        },
        rotate: interval === 'day' ? -45 : 0,
        rotateAlways: interval === 'day'
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
        formatter: (value, { dataPointIndex }) => {
          if (limitedData[dataPointIndex]) {
            const date = moment(limitedData[dataPointIndex].date);
            return interval === 'day' 
              ? date.format('DD MMM YYYY')
              : date.format('HH:mm');
          }
          return value;
        }
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
      horizontalAlign: 'left',
      labels: {
        colors: textColor
      }
    },
    colors: [primaryColor, secondaryColor],
    markers: {
      size: interval === 'day' ? 3 : 4,
      hover: {
        size: interval === 'day' ? 6 : 8
      },
      fillColors: [primaryColor, secondaryColor],
      strokeColors: [primaryColor, secondaryColor],
      strokeWidth: 2,
      strokeOpacity: 0.8,
      fillOpacity: 0.8
    }
  }), [labels, gridColor, textColor, primaryColor, secondaryColor, isSolo, interval, limitedData]);

  // Memoize series data with proper limiting
  const series = useMemo(() => {
    const limitedHashrates = chartData.hashrates?.slice(-currentConfig.points) || [];
    
    if (isSolo) {
      return [
        {
          name: primarySeriesName,
          data: limitedHashrates
        }
      ];
    }
    
    const limitedPoolHashrates = chartData.poolhashrates?.slice(-currentConfig.points) || [];
    return [
      {
        name: primarySeriesName,
        data: limitedHashrates
      },
      {
        name: secondarySeriesName,
        data: limitedPoolHashrates
      }
    ];
  }, [chartData.hashrates, chartData.poolhashrates, isSolo, primarySeriesName, secondarySeriesName, currentConfig.points]);

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
            {effectiveLoading ? 'Loading data...' : 'Waiting for data...'}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box w="100%" h="300px" p="20px" position="relative">
      {/* Loading indicator */}
      {effectiveLoading && (
        <Flex
          position="absolute"
          top="10px"
          right="20px"
          zIndex={10}
          align="center"
          gap={2}
          bg={loadingBgColor}
          px={2}
          py={1}
          borderRadius="md"
          boxShadow="sm"
        >
          <Spinner size="sm" color={isSolo ? 'orange.500' : 'blue.500'} />
          <Text fontSize="xs" color={loadingTextColor}>
            Updating...
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
