import React from 'react';
import { useLazyQuery } from '@apollo/client';
import { useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdWifi } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import WifiSettingsCard from '../../UI/WifiSettingsCard';
import { MCU_WIFI_SCAN_QUERY } from '../../../graphql/mcu';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';

const WifiSettings = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');

  const [
    handleWifiScan,
    { loading: loadingWifiScan, error: errorWifiScan, data: dataWifiScan },
  ] = useLazyQuery(MCU_WIFI_SCAN_QUERY, { fetchPolicy: 'no-cache' });

  const handleButtonWifiScan = () => {
    handleWifiScan();
  };

  const wifiMode = {
    id: 'wifi',
    color: 'green',
    icon: MdWifi,
    title: intl.formatMessage({ id: 'settings.sections.system.wifi.scan.title' }),
    buttonTitle: intl.formatMessage({ id: 'settings.sections.system.wifi.scan.button' }),
    description: intl.formatMessage({ id: 'settings.sections.system.wifi.scan.description' }),
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
        handleButton={handleButtonWifiScan}
        isDisabled={loadingWifiScan}
      />
      {(dataWifiScan || loadingWifiScan || errorWifiScan) && (
        <WifiSettingsCard
          textColor={textColor}
          loading={loadingWifiScan}
          error={errorWifiScan}
          data={dataWifiScan}
          onScan={handleWifiScan}
        />
      )}
    </PanelCard>
  );
};

export default WifiSettings;