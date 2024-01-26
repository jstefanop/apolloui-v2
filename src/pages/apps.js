import {
  Box,
  useColorModeValue,
  Grid,
  Flex,
  Link,
  SimpleGrid,
  Button,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import _ from 'lodash';

import Card from '../components/card/Card';
import InstalledAppItem from '../components/UI/InstalledAppItem';
import AppCard from '../components/UI/AppCard';
import BannerApp from '../components/UI/BannerApp';

import Nft1 from '../assets/img/apps/Nft1.png';
import Nft2 from '../assets/img/apps/Nft2.png';
import Nft3 from '../assets/img/apps/Nft3.png';
import Nft4 from '../assets/img/apps/Nft4.png';
import Nft5 from '../assets/img/apps/Nft5.png';
import Nft6 from '../assets/img/apps/Nft6.png';
import { MempoolIcon } from '../components/UI/Icons/MempoolIcon';

const Apps = () => {
  const cardColor = useColorModeValue('white', 'brand.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.500', 'white');

  return (
    <Box pt={{ base: '180px', md: '80px', xl: '80px' }}>
      {/* Main Fields */}
      <Grid
        mb="20px"
        gridTemplateColumns={{ xl: 'repeat(3, 1fr)', '2xl': '1fr 0.46fr' }}
        gap={{ base: '20px', xl: '20px' }}
        display={{ base: 'block', xl: 'grid' }}
      >
        <Flex
          flexDirection="column"
          gridArea={{ xl: '1 / 1 / 2 / 3', '2xl': '1 / 1 / 2 / 2' }}
        >
          <BannerApp
            icon={
              <MempoolIcon w="66px" h="66px" borderRadius="8px" me="16px" />
            }
            name="Mempool"
            author="Mempool Space K.K."
          />
          <Flex direction="column">
            <Flex
              mt="45px"
              mb="20px"
              justifyContent="space-between"
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'start', md: 'center' }}
            >
              <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">
                Applications list
              </Text>
            </Flex>
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              mb={{ base: '20px', xl: '0px' }}
              gap="20px"
            >
              <AppCard
                name="Mempool"
                description="Mempool is the fully-featured mempool visualizer, explorer, and API service running at mempool.space. It is an open-source project developed and operated for the benefit of the Bitcoin community, with a focus on the emerging transaction fee market that is evolving Bitcoin into a multi-layer ecosystem."
                image={Nft1}
                author="Mempool Space K.K."
                download="#"
              />
            </SimpleGrid>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          gridArea={{ xl: '1 / 3 / 2 / 4', '2xl': '1 / 2 / 2 / 3' }}
        >
          <Card p="0px">
            <Flex
              align={{ sm: 'flex-start', lg: 'center' }}
              justify="space-between"
              w="100%"
              px="22px"
              py="18px"
            >
              <Text color={textColor} fontSize="xl" fontWeight="600">
                Installed apps
              </Text>
            </Flex>

            <InstalledAppItem
              name="Mempool"
              author="Mempool Space K.K."
              icon={
                <MempoolIcon w="66px" h="66px" borderRadius="8px" me="16px" />
              }
              link="#"
            />
          </Card>
        </Flex>
      </Grid>
    </Box>
  );
};

export default Apps;
