import React from 'react';
import dynamic from 'next/dynamic';
import moment from '../../lib/moment';
import { displayHashrate } from '../../lib/utils';
import { useTheme, useColorModeValue, Box } from '@chakra-ui/react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const HashrateChart = ({ dataAnalytics }) => {
  const theme = useTheme();

  const gridColor = useColorModeValue(theme.colors.secondaryGray[400], theme.colors.secondaryGray[900]);
  const textColor = useColorModeValue(theme.colors.secondaryGray[700], theme.colors.secondaryGray[700]);
  const minerColor = useColorModeValue(theme.colors.blue[500], theme.colors.blue[500]);
  const poolColor = useColorModeValue(theme.colors.brand[600], theme.colors.brand[600]);

  // Ensure data is limited to exactly 24 data points to prevent memory accumulation
  const limitedData = React.useMemo(() => {
    if (!dataAnalytics || !Array.isArray(dataAnalytics)) {
      return [];
    }
    return dataAnalytics.slice(-24);
  }, [dataAnalytics]);

  const labels = limitedData.map((item) =>
    moment(item.date).startOf('hour').format('HH:mm')
  );

  const hashrates = limitedData.map((item) => item.hashrate);
  const poolhashrates = limitedData.map((item) => item.poolHashrate);

  const chartOptions = {
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
      }
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
  };

  const series = [
    {
      name: 'Miner',
      data: hashrates
    },
    {
      name: 'Pool',
      data: poolhashrates
    }
  ];

  return (
    <Box w="100%" h="300px" p="20px">
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="line"
        height="100%"
        width="100%"
      />
    </Box>
  );
};

export default HashrateChart;