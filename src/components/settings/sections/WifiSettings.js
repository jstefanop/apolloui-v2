import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdWifi } from 'react-icons/md';
import PanelCard from '../../UI/PanelCard';
import WifiPanel from '../../wifi/WifiPanel';

const WifiSettings = () => {
  const intl = useIntl();
  const textColor = useColorModeValue('brands.900', 'white');

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.system.wifi.title' })}
      description={intl.formatMessage({ id: 'settings.sections.system.wifi.description' })}
      textColor={textColor}
      icon={MdWifi}
      mb="20px"
    >
      <WifiPanel />
    </PanelCard>
  );
};

export default WifiSettings;
