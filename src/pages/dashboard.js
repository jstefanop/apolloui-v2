import {
  Box,
  useColorModeValue,
  Grid,
  GridItem,
  Text,
  Flex,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';

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
import Card from '../components/card/Card';
import IconBox from '../components/icons/IconBox';
import NoCardStatistics from '../components/UI/NoCardStatistics';
import NoCardStatisticsGauge from '../components/UI/NoCardStatisticsGauge';
import TileCard from '../components/UI/TileCard';

const Dashboard = () => {
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

  return (
    <Box>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns={{ base: 'repeat(6, 1fr)' }}
        templateAreas={`'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData' 'Hashrate Hashrate Hashrate MainData MainData MainData'`}
        gap={'20px'}
        mb={'10px'}
      >
        <Grid gridArea="Hashrate">
          <GridItem>
            <TileCard
              cardColor={hashCardColor}
              icon={MdLocalFireDepartment}
              iconColor={iconColor}
              iconBgColor={hashIconBgColor}
              secondaryTextColor={hashSecondaryColor}
              title="Current hashrate"
              mainData="2.98 TH/s"
              secondaryData="2.87 TH/s"
              secondaryText="15 minutes average"
            />
          </GridItem>
        </Grid>
        <Grid
          gridArea="MainData"
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
            templateColumns={{ base: 'repeat(2, 1fr)' }}
            templateAreas={{
              base: `'. .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
              <Card py="15px" bgColor={cardColor}>
                <Flex direction="column" my="auto">
                  <NoCardStatistics
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg={'white'}
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdWatchLater}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="Miner temperature"
                    value="62.5°C"
                  />
                  <NoCardStatistics
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg={'white'}
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdMemory}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="System temperature"
                    value="45.9°C"
                  />
                  <NoCardStatistics
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        bg={'white'}
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdWarning}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="Hardware errors"
                    value="0.9%"
                  />
                </Flex>
              </Card>
            </GridItem>
            <GridItem>
              <TileCard
                cardColor={powerCardColor}
                icon={MdPower}
                iconColor={iconColor}
                iconBgColor={powerIconBgColor}
                title="Power usage"
                mainData="202 Watt"
              />
            </GridItem>
          </Grid>

          {/* MIDDLE */}
          <Grid
            gridArea="Middle"
            templateRows="repeat(1, 1fr)"
            templateColumns={{ base: 'repeat(3, 1fr)' }}
            templateAreas={{
              base: `'. . .'`,
            }}
            gap={'20px'}
          >
            <GridItem>
              <NoCardStatisticsGauge
                id="minerTemp"
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon
                        w="32px"
                        h="32px"
                        as={MdWatchLater}
                        color="brand.500"
                      />
                    }
                  />
                }
                name="Miner temperature"
                value="62.5°C"
                rawValue="78"
                total="90"
                gauge={true}
              />
            </GridItem>
            <GridItem>
              <NoCardStatisticsGauge
                id="systemTemp"
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon w="32px" h="32px" as={MdMemory} color="brand.500" />
                    }
                  />
                }
                name="System temperature"
                value="45.9°C"
                rawValue="45.9"
                total="90"
                gauge={true}
              />
            </GridItem>
            <GridItem>
              <NoCardStatisticsGauge
                id="hwErr"
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    icon={
                      <Icon
                        w="32px"
                        h="32px"
                        as={MdWarning}
                        color="brand.500"
                      />
                    }
                  />
                }
                name="Hardware errors"
                value="0.9%"
                rawValue="15"
                total="100"
                gauge={true}
              />
            </GridItem>
          </Grid>

          {/* BOTTOM */}
          <Grid gridArea="Bottom">
            <GridItem>
              <Card py="15px" bgColor={'white'}>
                <Flex m="2">
                  <Text fontSize="lg" fontWeight="800">
                    Node status
                  </Text>
                </Flex>
                <Flex
                  my="auto"
                  align={{ base: 'center', xl: 'start' }}
                  justify={{ base: 'center', xl: 'center' }}
                  direction="row"
                >
                  <NoCardStatisticsGauge
                    id="minerTemp"
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdWatchLater}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="Miner temperature"
                    value="62.5°C"
                  />
                  <NoCardStatisticsGauge
                    id="minerTemp"
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdWatchLater}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="Miner temperature"
                    value="62.5°C"
                  />
                  <NoCardStatisticsGauge
                    id="minerTemp"
                    startContent={
                      <IconBox
                        w="56px"
                        h="56px"
                        icon={
                          <Icon
                            w="32px"
                            h="32px"
                            as={MdWatchLater}
                            color="brand.500"
                          />
                        }
                      />
                    }
                    name="Miner temperature"
                    value="62.5°C"
                  />
                </Flex>
              </Card>
            </GridItem>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
