import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { TbArtboardFilled } from 'react-icons/tb';
import PanelCard from '../../UI/PanelCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useMinerSettings } from '../hooks/useMinerSettings';

const PowerLedSettings = () => {
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const {
    minerPowerLedMode,
    handleSwitchPowerLedOff,
  } = useMinerSettings();

  return (
    <PanelCard
      title={'Miner Status Light'}
      description={'Turn off/on the front status led'}
      textColor={textColor}
      icon={TbArtboardFilled}
      mb="20px"
    >
      <SimpleSwitchSettingsItem
        item={minerPowerLedMode}
        textColor={textColor}
        sliderTextColor={sliderTextColor}
        inverted={false}
        handleSwitch={handleSwitchPowerLedOff}
      />
    </PanelCard>
  );
};

export default PowerLedSettings;