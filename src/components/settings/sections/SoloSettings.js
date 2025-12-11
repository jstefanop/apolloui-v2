import React, { useState, useEffect } from 'react';
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Box,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { GrUserWorker } from 'react-icons/gr';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useSettings } from '../context/SettingsContext';
import { isValidBitcoinAddress, isCompatibleBitcoinAddress } from '../../../lib/utils';
import { useSelector, shallowEqual } from 'react-redux';
import { nodeSelector } from '../../../redux/reselect/node';
import { presetPools } from '../../../lib/utils';
import { useIntl } from 'react-intl';
import { useDeviceType } from '../../../contexts/DeviceConfigContext';

const SoloSettings = () => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const isSoloNode = deviceType === 'solo-node';
  const { settings, setSettings, setErrorForm } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');
  const infoBgColor = useColorModeValue('blue.50', 'blue.900');
  const infoBorderColor = useColorModeValue('blue.200', 'blue.700');
  const infoIconColor = useColorModeValue('blue.500', 'blue.300');
  const infoTextColor = useColorModeValue('blue.700', 'blue.200');

  // Get solo mining mode settings
  const [soloMiningMode, setSoloMiningMode] = useState({
    id: 'solo',
    color: 'green',
    icon: GrUserWorker,
    title: intl.formatMessage({ id: 'settings.sections.solo.mining_mode' }),
    selected: settings.nodeEnableSoloMining || false,
    description: intl.formatMessage({ id: 'settings.sections.solo.mining_mode_description' }),
  });

  // Update the state when settings change
  useEffect(() => {
    setSoloMiningMode(prevState => ({
      ...prevState,
      selected: settings.nodeEnableSoloMining || false
    }));
  }, [settings.nodeEnableSoloMining]);

  // Node data
  const { data: dataNode } = useSelector(nodeSelector, shallowEqual);
  const { blocksCount, blockHeader } = dataNode || {};

  // BTC Signature prefix and suffix (visual only)
  const btcsigPrefix = '/FutureBit-';
  const btcsigSuffix = '/';

  // Check for btcsig setting - save only the editable part (API receives just the name)
  const handleBtcsigChange = (e) => {
    setSettings({ ...settings, btcsig: e.target.value });
  };

  const handleSwitchSoloMiningMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;

    // Update local state
    setSoloMiningMode({ ...soloMiningMode, selected: !v });

    let poolChanged;

    if (!v) {
      poolChanged = {
        ...settings.pool,
        url: '127.0.0.1:3333',
        password: 'x',
      };
    } else {
      poolChanged = {
        ...settings.pool,
        url: '',
        password: 'x',
      };
    }

    setSettings({
      ...settings,
      nodeEnableSoloMining: !v,
      pool: poolChanged
    });
  };

  const handleSoloMiningChange = (e) => {
    setErrorForm(null);

    if (!isValidBitcoinAddress(e.target.value))
      setErrorForm(intl.formatMessage({ id: 'settings.sections.solo.invalid_address' }));

    if (!isCompatibleBitcoinAddress(e.target.value))
      setErrorForm(intl.formatMessage({ id: 'settings.sections.solo.incompatible_address' }));

    const poolChanged = {
      enabled: true, // Ensure enabled is set
      index: 1, // Ensure index is set
      ...settings.pool,
      url: isSoloNode ? 'stratum+tcp://127.0.0.1:3333' : '127.0.0.1:3333',
      username: e.target.value,
      password: 'x',
    };

    // Set preset for UI
    const preset = presetPools[2]; // Solo mining preset index

    setSettings({
      ...settings,
      nodeEnableSoloMining: true,
      pool: poolChanged,
    });
  };

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.solo.title' })}
      description={intl.formatMessage({ id: 'settings.sections.solo.description' })}
      textColor={textColor}
      icon={GrUserWorker}
    >
      {/* For solo-node, always show the wallet field. For miner, check if node is synced or solo mining is enabled */}
      {isSoloNode || (blockHeader && blockHeader === blocksCount) || soloMiningMode.selected ? (
        <>
          {/* Show switch only for non-solo-node devices */}
          {!isSoloNode && (
            <SimpleSwitchSettingsItem
              item={soloMiningMode}
              textColor={textColor}
              sliderTextColor={inputTextColor}
              handleSwitch={handleSwitchSoloMiningMode}
            />
          )}
          {/* Show wallet field if solo mining is enabled or if it's a solo-node */}
          {(soloMiningMode.selected || isSoloNode) && (
            <>
              {/* Show warning for solo-node if node is not synced */}
              {isSoloNode && (!blockHeader || blockHeader !== blocksCount) && (
                <SimpleCard
                  bg="orange.300"
                  title={intl.formatMessage({ id: 'settings.sections.solo.cannot_enable' })}
                  textColor={'orange.600'}
                  mb="20px"
                >
                  <Text fontSize="sm" color="gray.800">
                    {intl.formatMessage({ id: 'settings.sections.solo.node_not_synced' })}
                  </Text>
                </SimpleCard>
              )}
              <SimpleCard
                title={intl.formatMessage({ id: 'settings.sections.solo.wallet_address' })}
                textColor={textColor}
              >
                <Input
                  color={inputTextColor}
                  name="wallet"
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder={intl.formatMessage({ id: 'settings.sections.solo.wallet_placeholder' })}
                  value={settings.pool?.username || ''}
                  onChange={handleSoloMiningChange}
                />
                <Flex
                  mt="4"
                  p="4"
                  bg={infoBgColor}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={infoBorderColor}
                  align="flex-start"
                >
                  <Icon
                    as={MdInfo}
                    w="20px"
                    h="20px"
                    color={infoIconColor}
                    mr="3"
                    mt="1"
                    flexShrink={0}
                  />
                  <Text
                    fontSize="sm"
                    color={infoTextColor}
                  >
                    {intl.formatMessage({ id: 'settings.sections.solo.wallet_info' })}
                  </Text>
                </Flex>
              </SimpleCard>
            </>
          )}
          {(soloMiningMode.selected || isSoloNode) && settings.nodeEnableTor && (
            <Alert mt="5" borderRadius={'10px'} status={'error'}>
              <AlertIcon />
              <AlertDescription>
                {intl.formatMessage({ id: 'settings.sections.solo.tor_warning' })}
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <SimpleCard
          bg="orange.300"
          title={intl.formatMessage({ id: 'settings.sections.solo.cannot_enable' })}
          textColor={'orange.600'}
          mt="20px"
        >
          <Text fontSize="sm" color="gray.800">
            {intl.formatMessage({ id: 'settings.sections.solo.node_not_synced' })}
          </Text>
        </SimpleCard>
      )}

      <SimpleCard title={intl.formatMessage({ id: 'settings.sections.solo.btc_signature' })} textColor={textColor}>
        <InputGroup>
          <InputLeftAddon>{btcsigPrefix}</InputLeftAddon>
          <Input
            color={inputTextColor}
            name="btcsig"
            type="text"
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
            placeholder={intl.formatMessage({ id: 'settings.sections.solo.btc_signature_placeholder' })}
            value={settings.btcsig || ''}
            onChange={handleBtcsigChange}
          />
          <InputRightAddon>{btcsigSuffix}</InputRightAddon>
        </InputGroup>
        <Flex
          mt="4"
          p="4"
          bg={infoBgColor}
          borderRadius="md"
          border="1px solid"
          borderColor={infoBorderColor}
          align="flex-start"
        >
          <Icon
            as={MdInfo}
            w="20px"
            h="20px"
            color={infoIconColor}
            mr="3"
            mt="1"
            flexShrink={0}
          />
          <Text
            fontSize="sm"
            color={infoTextColor}
          >
            {intl.formatMessage({ id: 'settings.sections.solo.btc_signature_info' })}
          </Text>
        </Flex>
      </SimpleCard>
    </PanelCard>
  );
};

export default SoloSettings;