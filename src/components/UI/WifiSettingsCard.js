import {
  Icon,
  Text,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  Badge,
  Box,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  FormControl,
  InputGroup,
  InputRightElement,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { BulletList } from 'react-content-loader';
import { useLazyQuery } from '@apollo/client';
import Card from '../card/Card';
import {
  MCU_WIFI_CONNECT_QUERY,
  MCU_WIFI_DISCONNECT_QUERY,
} from '../../graphql/mcu';
import { Wifi01Icon } from './Icons/Wifi01Icon';
import { Wifi02Icon } from './Icons/Wifi02Icon';
import { Wifi03Icon } from './Icons/Wifi03Icon';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { wifiSelector } from '../../redux/reselect/wifi';
import { updateWifi } from '../../redux/slices/wifiSlice';

const WifiSettingsCard = ({ textColor, loading, error, data, onScan }) => {
  const cardBgColor = useColorModeValue('gray.50', 'secondaryGray.900');
  const inputBgColor = useColorModeValue('gray.50', 'secondaryGray.900');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputHoverBorderColor = useColorModeValue('blue.400', 'blue.300');
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.400');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [errorConnect, setErrorConnect] = useState(false);
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [passphrase, setPassphrase] = useState('');

  // Wifi data
  const {
    data: dataWifi,
    error: errorWifi,
    loading: loadingWifi,
  } = useSelector(wifiSelector, shallowEqual);

  const initialState = {
    Mcu: {
      wifiScan: {
        error: null,
        result: {
          wifiScan: null,
        },
      },
    },
  };

  const {
    Mcu: {
      wifiScan: {
        error: resultError,
        result: { wifiScan: networks },
      },
    },
  } = data || initialState;

  const [
    wifiConnect,
    {
      loading: loadingWifiConnect,
      error: errorWifiConnect,
      data: dataWifiConnect,
    },
  ] = useLazyQuery(MCU_WIFI_CONNECT_QUERY);

  const [wifiDisconnect, { loading: loadingWifiDisconnect }] = useLazyQuery(
    MCU_WIFI_DISCONNECT_QUERY
  );

  const handleWifiConnect = async (ssid) => {
    dispatch(
      updateWifi({
        loading: false,
        error: null,
        data: null,
      })
    );
    setErrorConnect(false);
    if (!passphrase || passphrase === '') {
      setErrorConnect('Please enter the passphrase');
      return;
    }
    await wifiConnect({ variables: { input: { ssid, passphrase } } });
    setPassphrase('');
  };

  const handleWifiDisconnect = async () => {
    await wifiDisconnect();
    dispatch(
      updateWifi({
        data: null,
      })
    );
    onScan();
  };

  const handleSwitch = (index) => {
    setShow(index);
    setErrorConnect(false);
    dispatch(
      updateWifi({
        loading: false,
        error: null,
        data: null,
      })
    );
  };

  useEffect(() => {
    dispatch(
      updateWifi({
        loading: loadingWifiConnect,
        error: errorWifiConnect,
        data: dataWifiConnect,
      })
    );
  }, [dispatch, errorWifiConnect, dataWifiConnect, loadingWifiConnect]);

  useEffect(() => {
    if (!loading) return;
    setShow(false);
    setErrorConnect(false);
  }, [loading]);

  useEffect(() => {
    if (dataWifi && dataWifi.address) onScan();
  }, [dataWifi, onScan]);

  return (
    <Card
      bg="transparent"
      boxShadow="unset"
      px="24px"
      py="21px"
      transition="0.2s linear"
    >

      <Box px="11px" mt={'2'}>
        <Flex direction={'column'}>
          {loading ? (
            <BulletList width="400px" />
          ) : error || resultError ? (
            <Alert borderRadius="8px" status="error" variant="subtle">
              <Flex>
                <AlertIcon />
                <Flex direction="column">
                  <AlertTitle mr="12px">Error</AlertTitle>
                  <AlertDescription>
                    Wifi scan had some problems.
                  </AlertDescription>
                </Flex>
              </Flex>
              <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
          ) : (
            networks &&
            networks.map((network, index) => {
              return (
                <Flex key={index} flexDir={'column'}>
                  <Flex position={'relative'} alignItems={'center'} my={'4'}>
                    <Icon
                      w="24px"
                      h="24px"
                      mr="3"
                      as={
                        network.signal > 30 && network.signal <= 60
                          ? Wifi01Icon
                          : network.signal <= 30
                          ? Wifi02Icon
                          : Wifi03Icon
                      }
                    />
                    <Text
                      fontWeight="400"
                      color={textColor}
                      fontSize="sm"
                      w={'100%'}
                      marginInlineEnd={'2'}
                    >
                      {network.ssid}
                    </Text>
                    <Flex direction={{ base: 'row' }}>
                      <Stack direction={'row'}>
                        {network.inuse && (
                          <Badge
                            variant="subtle"
                            colorScheme={'whatsapp'}
                            mr="5"
                          >
                            Active
                          </Badge>
                        )}
                        {!loadingWifi && show === index && (
                          <FormControl isRequired w={'240px'} mt={-2}>
                            <InputGroup size="md">
                              <Input
                                isRequired={true}
                                fontSize="sm"
                                placeholder="Your wifi passphrase"
                                type={showLockPassword ? 'text' : 'password'}
                                onChange={(e) => setPassphrase(e.target.value)}
                                id="passphrase"
                                bg={inputBgColor}
                                borderColor={inputBorderColor}
                                color={inputTextColor}
                                _hover={{
                                  borderColor: inputHoverBorderColor,
                                }}
                                _focus={{
                                  borderColor: inputFocusBorderColor,
                                  boxShadow: `0 0 0 1px ${inputFocusBorderColor}`,
                                }}
                              />
                              <InputRightElement width="4.5rem">
                                <Button
                                  h="1.75rem"
                                  size="sm"
                                  onClick={() =>
                                    setShowLockPassword(!showLockPassword)
                                  }
                                >
                                  {showLockPassword ? 'Hide' : 'Show'}
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                          </FormControl>
                        )}
                        {(loadingWifi || loadingWifiDisconnect) &&
                        show === index ? (
                          <Spinner size="sm" />
                        ) : (
                          <Button
                            isDisabled={loadingWifi}
                            colorScheme={
                              network.inuse
                                ? 'gray.800'
                                : show === index
                                ? 'blue'
                                : 'gray'
                            }
                            variant={'outline'}
                            size={'xs'}
                            mb={'2'}
                            onClick={() =>
                              network.inuse
                                ? handleWifiDisconnect()
                                : show === index
                                ? handleWifiConnect(network.ssid)
                                : handleSwitch(index)
                            }
                          >
                            {network.inuse
                              ? 'Disconnect'
                              : show === index
                              ? 'Activate'
                              : 'Connect'}
                          </Button>
                        )}
                      </Stack>
                    </Flex>
                  </Flex>
                  {show === index && errorConnect && (
                    <Text color="red" fontSize="xs" align={'right'}>
                      {errorConnect}
                    </Text>
                  )}
                  {show === index &&
                    errorWifi &&
                    errorWifi.map((error, indexE) => {
                      return (
                        <Text
                          color="red"
                          fontSize="xs"
                          align={'right'}
                          key={indexE}
                        >
                          {error.message}
                        </Text>
                      );
                    })}
                </Flex>
              );
            })
          )}
        </Flex>
      </Box>
    </Card>
  );
};

export default WifiSettingsCard;
