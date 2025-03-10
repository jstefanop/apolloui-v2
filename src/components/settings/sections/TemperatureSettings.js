import React from 'react';
import {
  FormControl,
  RadioGroup,
  Radio,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdDeviceThermostat } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';

const TemperatureSettings = () => {
  const { settings, setSettings } = useSettings();
  const textColor = useColorModeValue('brands.900', 'white');

  const handleTemperatureUnitChange = (value) => {
    setSettings({
      ...settings,
      temperatureUnit: value,
    });
  };

  return (
    <PanelCard
      title={'Temperature Unit'}
      description={'Choose your preferred unit'}
      textColor={textColor}
      icon={MdDeviceThermostat}
      mb="20px"
    >
      <SimpleCard textColor={textColor}>
        <FormControl>
          <RadioGroup
            onChange={handleTemperatureUnitChange}
            value={settings.temperatureUnit || 'c'}
          >
            <Flex flexDirection="column" gap="10px">
              <Radio value="c">Celsius (°C)</Radio>
              <Radio value="f">Fahrenheit (°F)</Radio>
            </Flex>
          </RadioGroup>
        </FormControl>
      </SimpleCard>
    </PanelCard>
  );
};

export default TemperatureSettings;