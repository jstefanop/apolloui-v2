import {
  Icon,
  Text,
  Flex,
  FormLabel,
  FormControl,
  Button,
  useColorModeValue,
  Stack,
  Badge,
  Box,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { RiScan2Fill } from 'react-icons/ri';
import { MdBlock } from 'react-icons/md';
import Card from '../card/Card';

const WifiSettingsCard = ({ item, textColor }) => {
  const cardBgColor = useColorModeValue('gray.50', 'secondaryGray.900');
  return (
    <Card
      bg='transparent'
      boxShadow='unset'
      px='24px'
      py='21px'
      transition='0.2s linear'
    >
      <Flex direction={{ base: 'column' }} justify='center'>
        <Flex direction='column'>
          <Text
            color='secondaryGray.600'
            fontSize={{ base: 'xs', lg: 'sm' }}
            fontWeight='400'
            me='14px'
          >
            Click the scan button and your system will scan for available wifi
            networks. Click one of the available SSIDs, and enter your WiFi
            passphrase. Clicking the disconnect button will delete all saved
            WiFi connections, if you are having issues connecting, click the
            disconnect button before trying anything else.
          </Text>
        </Flex>

        <Flex direction={{ base: 'row' }} my={'5'}>
          <Stack direction={'row'}>
            <Button
              leftIcon={<MdBlock />}
              colorScheme={'orange'}
              variant={'solid'}
            >
              Disconnect
            </Button>
            <Button
              leftIcon={<RiScan2Fill />}
              colorScheme={'blue'}
              variant={'outline'}
            >
              Scan
            </Button>
          </Stack>
        </Flex>
      </Flex>

      <Box px='11px' mt={'2'}>
        <Flex direction={'column'}>
          <Flex position={'relative'} alignItems={'center'} my={'4'}>
            <Text
              fontWeight='bold'
              color={textColor}
              fontSize='md'
              w={'100%'}
              marginInlineEnd={'2'}
            >
              Wifi Network 12345
            </Text>
            <Flex direction={'column'} alignItems={'center'}>
              <Button
                colorScheme={'gray'}
                variant={'outline'}
                size={'xs'}
                mb={'2'}
              >
                Connect
              </Button>
              <Progress
                value='60'
                variant='table'
                colorScheme={'green'}
                h='6px'
              />
            </Flex>
          </Flex>
          <Flex position={'relative'} alignItems={'center'} my={'4'}>
            <Text
              fontWeight='bold'
              color={textColor}
              fontSize='md'
              w={'100%'}
              marginInlineEnd={'2'}
            >
              Wifi Network 6789
            </Text>
            <Flex direction={'column'} alignItems={'center'}>
              <Button
                colorScheme={'gray'}
                variant={'outline'}
                size={'xs'}
                mb={'2'}
              >
                Connect
              </Button>
              <Progress
                value='20'
                variant='table'
                colorScheme={'red'}
                h='6px'
              />
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};

export default WifiSettingsCard;
