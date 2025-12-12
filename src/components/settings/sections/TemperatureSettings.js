import React from 'react';
import {
  FormControl,
  RadioGroup,
  Radio,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdDeviceThermostat } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';

const TemperatureSettings = () => {
  const intl = useIntl();
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
      title={intl.formatMessage({ id: 'settings.sections.system.temperature_unit' })}
      description={intl.formatMessage({ id: 'settings.sections.system.temperature_description' })}
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