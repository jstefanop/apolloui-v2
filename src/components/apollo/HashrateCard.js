import { useColorModeValue } from '@chakra-ui/system';
import { Spinner } from '@chakra-ui/react';
import { MdOfflineBolt } from 'react-icons/md';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import TileCard from '../UI/TileCard';
import CountUp from 'react-countup';
import BannerHashrate from '../../assets/img/networking_banner.png';
import { FormattedMessage } from 'react-intl';

const HashrateCard = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  avgData,
  prevData,
  prevAvgData,
  serviceStatus,
}) => {
  const hashCardColor = useColorModeValue(
    'linear-gradient(135deg, #040406 0%, #4B5381 100%)',
    'linear-gradient(135deg, #4B5381 0%, #040406 100%)'
  );
  const hashIconBgColor = useColorModeValue('blue.600', 'white');
  const hashSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );

  const { status } = serviceStatus?.miner || {};

  // Determine the appropriate icon for the TileCard
  const tileCardIcon = (() => {
    if (status === 'offline') return MdOfflineBolt;
    if (status === 'pending') return Spinner;
    return MinerIcon;
  })();

  // Determine what to display in the main data section
  const mainDataContent = (() => {
    if (status === 'online' && data?.value != null) {
      return (
        <CountUp
          start={prevData?.value || 0}
          end={data.value}
          duration={1}
          decimals={2}
          suffix={` ${data.unit || ''}`}
          enableScrollSpy
          scrollSpyOnce
        />
      );
    } else if (status === 'offline') {
      return (
        <span>
          <FormattedMessage id="miner.status.offline.tag" />
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span>
          <FormattedMessage id="miner.status.pending" />
        </span>
      );
    }
    return null;
  })();

  return (
    <TileCard
      bannerImage={BannerHashrate}
      boxShadow={shadow}
      bgGradient={hashCardColor}
      icon={tileCardIcon}
      iconColor={iconColor}
      iconBgColor={'linear-gradient(290.56deg, #454D76 7.51%, #25283E 60.45%)'}
      secondaryTextColor={hashSecondaryColor}
      secondaryText={<FormattedMessage id="miner.hashrate.average" />}
      title={<FormattedMessage id="miner.hashrate.current" />}
      bigFont={true}
      loading={loading}
      errors={errors}
      mainData={mainDataContent}
      secondaryData={
        status === 'online' &&
        avgData?.value != null && (
          <CountUp
            start={prevAvgData?.value || 0}
            end={avgData.value}
            duration={1}
            decimals={2}
            suffix={` ${avgData.unit || ''}`}
            enableScrollSpy
            scrollSpyOnce
          />
        )
      }
    />
  );
};

export default HashrateCard;
