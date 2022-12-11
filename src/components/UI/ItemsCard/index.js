import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { MdPower, MdWarning, MdWatchLater } from 'react-icons/md';

import Card from '../../card/Card';
import ItemCard from './ItemCard';

const ItemsCard = () => {
  const textColor = useColorModeValue('brands.900', 'white');
  return (
    <Flex
      flexDirection='column'
      gridArea={{ xl: '1 / 3 / 2 / 4', '2xl': '1 / 2 / 2 / 3' }}
    >
      <Card p='0px'>
        <Flex
          align={{ sm: 'flex-start', lg: 'center' }}
          justify='space-between'
          w='100%'
          px='22px'
          py='18px'
        >
          <Text color={textColor} fontSize='xl' fontWeight='600'>
            History
          </Text>
          <Button variant='action'>See all</Button>
        </Flex>

        <ItemCard
          name='Colorful Heaven'
          author='By Mark Benjamin'
          date='30s ago'
          price='0.91 ETH'
        />
        <ItemCard
          name='Abstract Colors'
          author='By Esthera Jackson'
          date='58s ago'
          price='0.91 ETH'
        />
        <ItemCard
          name='ETH AI Brain'
          author='By Nick Wilson'
          date='1m ago'
          price='0.91 ETH'
        />
        <ItemCard
          name='Swipe Circles'
          author='By Peter Will'
          date='1m ago'
          price='0.91 ETH'
        />
      </Card>
    </Flex>
  );
};

export default ItemsCard;
