import React from 'react';
import { Divider, useColorModeValue } from '@chakra-ui/react';
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
    fanOverrideMode,
    isApolloIii,
    handleSwitchFanMode,
    handleCustomFanModeChange,
    handleCustomFanModeReset,
    handleSwitchFanOverride,
    handleFanOverrideChange,
    handleFanOverrideReset,
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
        // A fixed speed replaces the automatic loop, so the target temperature
        // has nothing to act on while the override is on.
        isDisabled={isApolloIii && fanOverrideMode.selected}
      />

      {isApolloIii && (
        <>
          <Divider mb="10px" />
          <SimpleSwitchSettingsItem
            item={fanOverrideMode}
            textColor={textColor}
            sliderTextColor={sliderTextColor}
            handleSwitch={handleSwitchFanOverride}
            handleCustomModeChange={handleFanOverrideChange}
            handleCustomModeReset={handleFanOverrideReset}
          />
        </>
      )}
    </PanelCard>
  );
};

export default FanSettings;