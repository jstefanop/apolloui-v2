import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import Card from '../card/Card.js';
import LineChart from '../charts/LineChart';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { MdBarChart, MdOutlineCalendarToday } from 'react-icons/md';
import { RiArrowUpSFill } from 'react-icons/ri';

const TotalHashrate = ({ ...rest }) => {
  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const bgHover = useColorModeValue(
    { bg: 'secondaryGray.400' },
    { bg: 'whiteAlpha.50' }
  );
  const bgFocus = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.100' }
  );

  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 13,
        left: 0,
        blur: 10,
        opacity: 0.1,
        color: '#4318FF',
      },
    },
    colors: ['#4318FF', '#39B8FF'],
    markers: {
      size: 0,
      colors: 'white',
      strokeColors: '#7551FF',
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: 'circle',
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      showNullDataPoints: true,
    },
    tooltip: {
      theme: 'dark',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      type: 'line',
    },
    xaxis: {
      categories: ['12:00', '01:00', '02:00', '03:00', '04:00', '05:00'],
      labels: {
        style: {
          colors: '#A3AED0',
          fontSize: '12px',
          fontWeight: '500',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
      column: {
        color: ['#7551FF', '#39B8FF'],
        opacity: 0.5,
      },
    },
    color: ['#7551FF', '#39B8FF'],
  };

  const chartData = [
    {
      name: 'Miner',
      data: [2.87, 2.34, 2.88, 2.9, 3.34, 2.67],
    },
    {
      name: 'Pool',
      data: [2.83, 2.38, 2.75, 2.5, 2.88, 2.6],
    },
  ];

  return (
    <Card
      justifyContent='center'
      align='center'
      direction='column'
      w='100%'
      mb='0px'
      {...rest}
    >
      <Flex justify='space-between' ps='0px' pe='20px' pt='5px'>
        <Flex align='center' w='100%'>
          <Text
            color={textColor}
            fontSize='22px'
            fontWeight='700'
            lineHeight='100%'
          >
            <Icon
              as={MdOutlineCalendarToday}
              color={textColorSecondary}
              me='4px'
            />
            Recent Hashrate
          </Text>
        </Flex>
      </Flex>
      <Flex w='100%' flexDirection={{ base: 'column', lg: 'row' }}>
        <Flex flexDirection='column' me='20px' mt='28px'>
          <Text
            color={textColor}
            fontSize='34px'
            textAlign='start'
            fontWeight='700'
            lineHeight='100%'
          >
            2.94 TH/s
          </Text>
          <Flex align='center' mb='20px'>
            <Text
              color='secondaryGray.600'
              fontSize='sm'
              fontWeight='500'
              mt='4px'
              me='12px'
            >
              1 hour average
            </Text>
            <Flex align='center' mt='6px'>
              <Icon as={RiArrowUpSFill} color='green.500' me='2px' mt='2px' />
              <Text color='green.500' fontSize='sm' fontWeight='700'>
                +2.45%
              </Text>
            </Flex>
          </Flex>

          <Flex align='center'>
            <Icon as={IoCheckmarkCircle} color='green.500' me='4px' />
            <Text color='green.500' fontSize='md' fontWeight='700'>
              On track
            </Text>
          </Flex>
        </Flex>
        <Box minH='260px' minW='80%' mt='auto'>
          <LineChart chartData={chartData} chartOptions={chartOptions} />
        </Box>
      </Flex>
    </Card>
  );
};

export default TotalHashrate
