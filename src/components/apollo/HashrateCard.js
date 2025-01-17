import { useColorModeValue } from '@chakra-ui/system';
import { Icon, Text } from '@chakra-ui/react';
import { MdOfflineBolt, MdPending } from 'react-icons/md';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import TileCard from '../UI/TileCard';
import CountUp from 'react-countup';
import BannerHashrate from '../../assets/img/networking_banner.png';

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
    if (status === 'pending') return MdPending;
    return MinerIcon;
  })();

  // Determine what to display in the main data section
  const mainDataContent = (() => {
    if (status === 'online') {
      return (
        <CountUp
          start={prevData?.value || 0}
          end={data?.value}
          duration="1"
          decimals="2"
          suffix={` ${data?.unit}`}
        />
      );
    } else if (status === 'offline') {
      return (
        <span>
          Offline
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span>
          Pending
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
      secondaryText="1 hour average"
      title="Current hashrate"
      bigFont={true}
      loading={loading}
      errors={errors}
      mainData={mainDataContent}
      secondaryData={
        status === 'online' &&
        avgData && (
          <CountUp
            start={prevAvgData?.value || 0}
            end={avgData?.value}
            duration="1"
            decimals="2"
            suffix={` ${avgData?.unit}`}
          />
        )
      }
    />
  );
};

export default HashrateCard;
