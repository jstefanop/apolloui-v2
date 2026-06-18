import React from 'react';
import {
  Box,
  Divider,
  FormLabel,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MinerIcon } from '../../UI/Icons/MinerIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useMinerSettings } from '../hooks/useMinerSettings';

const MinerModeSettings = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const {
    minerModes,
    currentMode,
    handleSwitchMinerMode,
    handleCustomModeChange,
    handleCustomModeReset,
    customTarget,
    setCustomTarget,
    customTargetSelectable,
  } = useMinerSettings();

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.miner.modes.title' })}
      description={intl.formatMessage({ id: 'settings.sections.miner.modes.description' })}
      textColor={textColor}
      badgeColor={currentMode.color}
      badgeText={currentMode.id.toUpperCase()}
      icon={MinerIcon}
      mb={'20px'}
    >
      {currentMode.id === 'custom' && customTargetSelectable && (
        <Box mb="15px">
          <FormLabel htmlFor="customTarget" color={textColor} fontWeight="bold">
            {intl.formatMessage({ id: 'settings.sections.miner.modes.custom.target.title' })}
          </FormLabel>
          <Select
            id="customTarget"
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value)}
          >
            <option value="apollo-btc-ii">
              {intl.formatMessage({ id: 'settings.sections.miner.modes.custom.target.apollo_btc_ii' })}
            </option>
            <option value="apollo-iii">
              {intl.formatMessage({ id: 'settings.sections.miner.modes.custom.target.apollo_iii' })}
            </option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt="1">
            {intl.formatMessage({ id: 'settings.sections.miner.modes.custom.target.description' })}
          </Text>
        </Box>
      )}

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