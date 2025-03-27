import { useTheme, useColorModeValue, Box, Spinner, Center } from '@chakra-ui/react';
import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { displayHashrate } from '../../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HashrateChart = ({ dataAnalytics }) => {
  const theme = useTheme();
  const chartRef = useRef(null);

  const gridColor = useColorModeValue(theme.colors.secondaryGray[400], theme.colors.secondaryGray[900]);
  const textColor = useColorModeValue(theme.colors.secondaryGray[700], theme.colors.secondaryGray[700]);
  const minerColor = useColorModeValue(theme.colors.blue[500], theme.colors.blue[500]);
  const poolColor = useColorModeValue(theme.colors.brand[600], theme.colors.brand[600]);

  const MAX_DATA_POINTS = 24;

  // Process and limit the data
  const processedData = useMemo(() => {
    if (!dataAnalytics || !Array.isArray(dataAnalytics)) {
      return { labels: [], hashrates: [], poolhashrates: [] };
    }

    // Sort by date to ensure we're getting the most recent data
    const sortedData = [...dataAnalytics].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    // Take only the most recent MAX_DATA_POINTS
    const limitedData = sortedData.slice(0, MAX_DATA_POINTS).reverse();

    const labels = limitedData.map((item) => moment(item.date).startOf('hour').format('HH:mm'));
    const hashrates = limitedData.map((item) => item.hashrate);
    const poolhashrates = limitedData.map((item) => item.poolHashrate);

    return { labels, hashrates, poolhashrates };
  }, [dataAnalytics]);

  const { labels, hashrates, poolhashrates } = processedData;

  // Create data for the chart
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Miner',
        data: hashrates,
        fill: false,
        borderColor: minerColor,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 12,
      },
      {
        label: 'Pool',
        data: poolhashrates,
        fill: false,
        borderColor: poolColor,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 12,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => displayHashrate(value, 'GH/s', true, 2),
          color: textColor,
        },
        grid: {
          color: gridColor,
        }
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: theme.colors.gray[600],
        bodyColor: gridColor,
        callbacks: {
          title: (context) => {
            return `Average at start of ${context[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label} ${displayHashrate(context.parsed.y, 'GH/s', true, 2)}`;
          },
        },
      },
      legend: {
        labels: {
          color: textColor,
        }
      }
    },
  };

  // Cleanup chart instance when component unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  // Show loading state if no data is available yet
  if (!dataAnalytics || !Array.isArray(dataAnalytics) || dataAnalytics.length === 0) {
    return (
      <Center w="100%" h="300px">
        <Spinner size="xl" thickness="4px" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box w="100%" h="300px" p="20px">
      <Line
        ref={chartRef}
        data={chartData}
        options={chartOptions}
      />
    </Box>
  );
};

export default HashrateChart;