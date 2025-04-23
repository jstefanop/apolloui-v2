import React from 'react';
import { useLazyQuery } from '@apollo/client';
import { useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdOutlineWifi, MdWifi } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import WifiSettingsCard from '../../UI/WifiSettingsCard';
import { MCU_WIFI_SCAN_QUERY } from '../../../graphql/mcu';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useSettings } from '../context/SettingsContext';

const WifiSettings = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const { settings, setSettings } = useSettings();

  const [
    handleWifiScan,
    { loading: loadingWifiScan, error: errorWifiScan, data: dataWifiScan },
  ] = useLazyQuery(MCU_WIFI_SCAN_QUERY, { fetchPolicy: 'no-cache' });

  const handleSwitchWifi = (e) => {
    const v = e.target.value === 'true' ? true : false;
    setSettings({ ...settings, connectedWifi: !v });
  };

  const wifiMode = {
    id: 'wifi',
    color: 'green',
    icon: MdWifi,
    title: intl.formatMessage({ id: 'settings.sections.system.wifi.title' }),
    selected: !settings.connectedWifi,
    description: intl.formatMessage({ id: 'settings.sections.system.wifi.description' }),
  };

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.system.wifi.title' })}
      description={intl.formatMessage({ id: 'settings.sections.system.wifi.description' })}
      textColor={textColor}
      icon={MdWifi}
      mb="20px"
    >
      <SimpleSwitchSettingsItem
        item={wifiMode}
        textColor={textColor}
        sliderTextColor={sliderTextColor}
        inverted={true}
        handleSwitch={handleSwitchWifi}
      />
      <WifiSettingsCard
        textColor={textColor}
        loading={loadingWifiScan}
        error={errorWifiScan}
        data={dataWifiScan}
        onScan={handleWifiScan}
      />
    </PanelCard>
  );
};

export default WifiSettings;