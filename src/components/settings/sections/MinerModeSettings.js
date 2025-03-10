import React from 'react';
import { Divider, useColorModeValue } from '@chakra-ui/react';
import { MinerIcon } from '../../UI/Icons/MinerIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useMinerSettings } from '../hooks/useMinerSettings';

const MinerModeSettings = () => {
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const {
    minerModes,
    currentMode,
    handleSwitchMinerMode,
    handleCustomModeChange,
    handleCustomModeReset,
  } = useMinerSettings();

  return (
    <PanelCard
      title={'Miner modes settings'}
      description={'Manage miner specific configurations'}
      textColor={textColor}
      badgeColor={currentMode.color}
      badgeText={currentMode.id.toUpperCase()}
      icon={MinerIcon}
      mb={'20px'}
    >
      {minerModes.map((mode, index) => {
        return (
          <div key={mode.id}>
            <SimpleSwitchSettingsItem
              item={mode}
              textColor={textColor}
              sliderTextColor={sliderTextColor}
              handleSwitch={handleSwitchMinerMode}
              handleCustomModeChange={handleCustomModeChange}
              handleCustomModeReset={handleCustomModeReset}
            />
            {index !== minerModes.length - 1 && (
              <Divider mb="10px" />
            )}
          </div>
        );
      })}
    </PanelCard>
  );
};

export default MinerModeSettings;