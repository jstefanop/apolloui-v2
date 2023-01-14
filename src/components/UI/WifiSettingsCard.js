import {
  Icon,
  Text,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  Badge,
  Box,
  Divider,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
} from '@chakra-ui/react';
import { BulletList } from 'react-content-loader';
import { useLazyQuery } from '@apollo/client';
import { BsWifi, BsWifi1, BsWifi2 } from 'react-icons/bs';
import Card from '../card/Card';
import { MCU_WIFI_CONNECT_QUERY, MCU_WIFI_DISCONNECT_QUERY } from '../../graphql/mcu';

const WifiSettingsCard = ({ textColor, loading, error, data }) => {
  const cardBgColor = useColorModeValue('gray.50', 'secondaryGray.900');
  const initialState = {
    Mcu: {
      wifiScan: {
        error: null,
        result: {
          wifiScan: null
        }
      }
    }
  };

  const {
    Mcu: {
      wifiScan: {
        error: resultError,
        result: { wifiScan: networks }
      }
    }
  } = data || initialState;

  const [
    handleWifiConnect,
    { loading: loadingWifiConnect, error: errorWifiConnect, data: dataWifiConnect },
  ] = useLazyQuery(MCU_WIFI_CONNECT_QUERY);

  const [
    handleWifiDisconnect,
    { loading: loadingWifiDisconnect, error: errorWifiDisconnect, data: dataWifiDisconnect },
  ] = useLazyQuery(MCU_WIFI_DISCONNECT_QUERY);

  return (
    <Card
      bg='transparent'
      boxShadow='unset'
      px='24px'
      py='21px'
      transition='0.2s linear'
    >
      <Flex direction={{ base: 'column' }}>
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

      <Box px='11px' mt={'2'}>
        <Flex direction={'column'}>
          {loading ? (
            <BulletList />
          ) : (error || resultError) ? (
            <Alert borderRadius='8px' status='error' variant='subtle'>
              <Flex>
                <AlertIcon />
                <Flex direction='column'>
                  <AlertTitle mr='12px'>Error</AlertTitle>
                  <AlertDescription>Wifi scan had some problems.</AlertDescription>
                </Flex>
              </Flex>
              <CloseButton position='absolute' right='8px' top='8px' />
            </Alert>
          ) : (
            networks && networks.map((network, index) => {
              return (
                <Flex position={'relative'} alignItems={'center'} my={'4'} key={index}>
                  <Icon w='24px' h='24px' mr='3' as={(network.signal > 30 && network.signal <= 60) ? BsWifi2 : (network.signal <= 30) ? BsWifi1 : BsWifi} />
                  <Text
                    fontWeight='400'
                    color={textColor}
                    fontSize='sm'
                    w={'100%'}
                    marginInlineEnd={'2'}
                  >
                    {network.ssid} - {network.signal}
                  </Text>
                  <Flex direction={{ base: 'row' }}>
                    <Stack direction={'row'}>
                      {network.inuse && <Badge variant='subtle' colorScheme={'whatsapp'} mr='5'>
                        Active
                      </Badge>}
                      <Button
                        colorScheme={'gray'}
                        variant={'outline'}
                        size={'xs'}
                        mb={'2'}
                        handleClick={() => network.inuse ? handleWifiDisconnect() : handleWifiConnect(network.ssid)}
                      >
                        {network.inuse ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Stack>
                  </Flex>
                </Flex>
              )
            })
          )}
        </Flex>
      </Box>
    </Card>
  );
};

export default WifiSettingsCard;
