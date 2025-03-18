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

const SoloSettings = () => {
  const { settings, setSettings, setErrorForm } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

  // Get solo mining mode settings
  const [soloMiningMode, setSoloMiningMode] = useState({
    id: 'solo',
    color: 'green',
    icon: GrUserWorker,
    title: 'SOLO Mining mode',
    selected: settings.nodeEnableSoloMining || false,
    description:
      'Enable solo mining mode to mine directly to your own Bitcoin Node. Note: your node will be restarted to apply.',
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
      setErrorForm('Please add a valid Bitcoin address');

    if (!isCompatibleBitcoinAddress(e.target.value))
      setErrorForm(
        'Warning: P2WSH and P2TR Bitcoin address are not valid for SOLO mining. Please add a different Bitcoin address'
      );

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
      title={'SOLO settings'}
      description={'Mine directly to your Bitcoin node'}
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
              title={'Wallet address'}
              textColor={textColor}
            >
              <Input
                color={inputTextColor}
                name="wallet"
                type="text"
                placeholder={'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                value={settings.pool.username}
                onChange={handleSoloMiningChange}
              />
            </SimpleCard>
          )}
          {soloMiningMode.selected && settings.nodeEnableTor && (
            <Alert mt="5" borderRadius={'10px'} status={'error'}>
              <AlertIcon />
              <AlertDescription>
                You have tor enabled, it is suggested to turn off
                tor for solo mining. Bitcoin nodes over the tor
                network propagate blocks slower, and there is a
                higher chance of orphaning a block
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <SimpleCard
          bg="orange.300"
          title={'Cannot enable SOLO mining'}
          textColor={'orange.600'}
          mt="20px"
        >
          <Text fontSize="sm" color="gray.800">
            Your Bitcoin node is not running or not fully synced.
            You can enable solo mining only after your node is fully
            synced.
          </Text>
        </SimpleCard>
      )}

      <SimpleCard title={'BTC Signature'} textColor={textColor}>
        <Input
          color={inputTextColor}
          name="btcsig"
          type="text"
          placeholder={'/Your preferred string/'}
          value={settings.btcsig}
          onChange={handleBtcsigChange}
        />
      </SimpleCard>
    </PanelCard>
  );
};

export default SoloSettings;