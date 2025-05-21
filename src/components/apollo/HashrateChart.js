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
import moment from '../../lib/moment';
import { displayHashrate } from '../../lib/utils';
import { useTheme, useColorModeValue, Box } from '@chakra-ui/react';
import React from 'react';


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

  // Create data for the chart
  const chartData = {
    labels: labels,
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

  return (
    <Box w="100%" h="300px" p="20px" >
      <Line
        data={chartData}
        options={chartOptions}
      />
    </Box>
  );
};

export default HashrateChart;