import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { FanIcon } from '../../UI/Icons/FanIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useMinerSettings } from '../hooks/useMinerSettings';

const FanSettings = () => {
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const {
    fanMode,
    handleSwitchFanMode,
    handleCustomFanModeChange,
    handleCustomFanModeReset,
  } = useMinerSettings();

  return (
    <PanelCard
      title={'Miner fan settings'}
      description={'Adjust the fan speed or set it to automatic'}
      textColor={textColor}
      icon={FanIcon}
      mb="20px"
    >
      <SimpleSwitchSettingsItem
        item={fanMode}
        textColor={textColor}
        sliderTextColor={sliderTextColor}
        inverted={true}
        handleSwitch={handleSwitchFanMode}
        handleCustomModeChange={handleCustomFanModeChange}
        handleCustomModeReset={handleCustomFanModeReset}
      />
    </PanelCard>
  );
};

export default FanSettings;