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
import { useTheme, useColorModeValue } from '@chakra-ui/react';

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

  const labels = dataAnalytics
    ? dataAnalytics.map((item) => moment(item.date).startOf('hour').format('HH:mm'))
    : [];
  const hashrates = dataAnalytics
    ? dataAnalytics.map((item) => item.hashrate)
    : [];
  const poolhashrates = dataAnalytics
    ? dataAnalytics.map((item) => item.poolHashrate)
    : [];

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
    <Line
      data={chartData}
      options={chartOptions}
      style={{ height: '300px', width: '100%' }}
    />
  );
};

export default HashrateChart;
