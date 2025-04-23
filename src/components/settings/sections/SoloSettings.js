import React, { useState, useEffect } from 'react';
import {
  Input,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
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

const SoloSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

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

  // Check for btcsig setting
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
      ...settings.pool,
      url: '127.0.0.1:3333',
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
      {(blockHeader && blockHeader === blocksCount) ||
        soloMiningMode.selected ? (
        <>
          <SimpleSwitchSettingsItem
            item={soloMiningMode}
            textColor={textColor}
            sliderTextColor={inputTextColor}
            handleSwitch={handleSwitchSoloMiningMode}
          />
          {soloMiningMode.selected && (
            <SimpleCard
              title={intl.formatMessage({ id: 'settings.sections.solo.wallet_address' })}
              textColor={textColor}
            >
              <Input
                color={inputTextColor}
                name="wallet"
                type="text"
                placeholder={intl.formatMessage({ id: 'settings.sections.solo.wallet_placeholder' })}
                value={settings.pool.username}
                onChange={handleSoloMiningChange}
              />
            </SimpleCard>
          )}
          {soloMiningMode.selected && settings.nodeEnableTor && (
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
        <Input
          color={inputTextColor}
          name="btcsig"
          type="text"
          placeholder={intl.formatMessage({ id: 'settings.sections.solo.btc_signature_placeholder' })}
          value={settings.btcsig}
          onChange={handleBtcsigChange}
        />
      </SimpleCard>
    </PanelCard>
  );
};

export default SoloSettings;