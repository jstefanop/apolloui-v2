import {
  Box,
  Icon,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
} from '@chakra-ui/react';

import IconBox from '../components/icons/IconBox';
import React from 'react';
import {
  MdLocalFireDepartment,
  MdPower,
  MdWarning,
  MdWatchLater,
  MdMemory,
  MdOutlinePower,
  MdOutlineSignalWifi0Bar,
} from 'react-icons/md';
import CountUp from 'react-countup';
import { BulletList, List } from 'react-content-loader';
import { useSelector } from 'react-redux';
import Card from '../components/card/Card';
import TileCard from '../components/UI/TileCard';
import { minerSelector } from '../redux/reselect/miner';

const Miner = () => {
  const cardColor = useColorModeValue('white', 'blue.700');
  const hashCardColor = useColorModeValue('blue.900', 'blue.500');
  const iconColor = useColorModeValue('white', 'brand.500');
  const hashIconBgColor = useColorModeValue('blue.600', 'white');
  const hashSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );
  const powerCardColor = useColorModeValue('gray.900', 'gray.500');
  const powerIconBgColor = useColorModeValue('gray.600', 'white');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  // Miner data
  const {
    loading: loadingMiner,
    data: { stats: dataMiner },
    error: errorMiner,
  } = useSelector(minerSelector);

  const {
    globalHashrate,
    globalAvgHashrate,
    minerPower,
    minerPowerPerGh,
    avgBoardTemp,
    avgBoardErrors,
  } = dataMiner;

  return (
    <Box>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Main Main Data Data Data Data' 'Main Main Data Data Data Data' 'Main Main Data Data Data Data'`}
        gap={'20px'}
        mb={'10px'}
      >
        <Grid
          gridArea="Main"
          templateRows="repeat(2, 1fr)"
          templateColumns={{ base: 'repeat(1, 1fr)' }}
          templateAreas={`'Hashrate' 'Power'`}
          gap={'20px'}
          mb={'10px'}
        >
          <GridItem gridArea="Hashrate">
            <TileCard
              boxShadow={shadow}
              bgColor={hashCardColor}
              icon={MdLocalFireDepartment}
              iconColor={iconColor}
              iconBgColor={hashIconBgColor}
              secondaryTextColor={hashSecondaryColor}
              title="Current hashrate"
              loading={loadingMiner}
              errors={errorMiner}
              mainData={
                <CountUp
                  start="0"
                  end={globalHashrate?.value}
                  duration="1"
                  decimals="2"
                  separator={' '}
                  suffix={` ${globalHashrate?.unit}`}
                />
              }
              secondaryData={
                <CountUp
                  start="0"
                  end={globalAvgHashrate?.value}
                  duration="1"
                  decimals="2"
                  separator={' '}
                  suffix={` ${globalAvgHashrate?.unit}`}
                />
              }
              secondaryText="15 minutes average"
            />
          </GridItem>

          <GridItem gridArea="Power">
            <TileCard
              boxShadow={shadow}
              bgColor={powerCardColor}
              icon={MdPower}
              iconColor={iconColor}
              iconBgColor={powerIconBgColor}
              title="Power usage"
              loading={loadingMiner}
              errors={errorMiner}
              mainData={
                <CountUp
                  start={0}
                  end={minerPower}
                  duration="1"
                  decimals="0"
                  suffix={` Watt`}
                />
              }
              secondaryData={
                <CountUp
                  start="0"
                  end={minerPowerPerGh}
                  duration="1"
                  decimals="2"
                  separator={' '}
                  suffix={` Wh`}
                />
              }
              secondaryText="Watt per TH/s"
              secondaryTextColor={hashSecondaryColor}
            />
          </GridItem>
        </Grid>

        <Grid
          gridArea="Data"
          templateRows="auto auto auto"
          templateColumns={{ base: 'repeat(1, 1fr)' }}
          templateAreas={{
            base: `'Top' 'Middle' 'Bottom'`,
          }}
          gap={'20px'}
        >
          {/* TOP */}
          <Grid
            gridArea="Top"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: 'repeat(4, 1fr)' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>Info</GridItem>
            <GridItem>Power</GridItem>
            <GridItem>Power</GridItem>
            <GridItem>Power</GridItem>
          </Grid>

          {/* MIDDLE */}
          <Grid
            gridArea="Middle"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: '1fr auto' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>1</GridItem>
            <GridItem>2</GridItem>
          </Grid>

          {/* BOTTOM */}
          <Grid gridArea="Bottom">
            <GridItem>bottom</GridItem>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Miner;
