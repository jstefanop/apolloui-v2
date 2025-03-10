import React from 'react';
import { useLazyQuery } from '@apollo/client';
import { useColorModeValue } from '@chakra-ui/react';
import { MdOutlineWifi } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import WifiSettingsCard from '../../UI/WifiSettingsCard';
import { MCU_WIFI_SCAN_QUERY } from '../../../graphql/mcu';

const WifiSettings = () => {
  const textColor = useColorModeValue('brands.900', 'white');

  const [
    handleWifiScan,
    { loading: loadingWifiScan, error: errorWifiScan, data: dataWifiScan },
  ] = useLazyQuery(MCU_WIFI_SCAN_QUERY, { fetchPolicy: 'no-cache' });

  return (
    <PanelCard
      title={'Wifi settings'}
      description={
        'Connect your system controller to a Wifi instead using ethernet'
      }
      textColor={textColor}
      icon={MdOutlineWifi}
      buttonText="Scan"
      handleButtonClick={handleWifiScan}
      buttonLoading={loadingWifiScan}
      mb={'20px'}
    >
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