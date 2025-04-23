import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { FanIcon } from '../../UI/Icons/FanIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useMinerSettings } from '../hooks/useMinerSettings';

const FanSettings = () => {
  const intl = useIntl();
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
      title={intl.formatMessage({ id: 'settings.sections.miner.fan.title' })}
      description={intl.formatMessage({ id: 'settings.sections.miner.fan.description' })}
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