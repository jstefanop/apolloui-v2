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
  status,
  title,
}) => {
  const hashCardColor = useColorModeValue(
    'linear-gradient(135deg, #040406 0%, #4B5381 100%)',
    'linear-gradient(135deg, #4B5381 0%, #040406 100%)'
  );
  const hashSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );

  const currentStatus = status || 'pending';

  const tileCardIcon = (() => {
    if (currentStatus === 'offline') return MdOfflineBolt;
    if (currentStatus === 'pending') return Spinner;
    return MinerIcon;
  })();

  const mainDataContent = (() => {
    if (currentStatus === 'online' && data?.value != null) {
      return (
        <CountUp
          end={data.value}
          duration={1}
          decimals={2}
          suffix={` ${data.unit || ''}`}
          preserveValue
        />
      );
    }
    if (currentStatus === 'offline') {
      return <span><FormattedMessage id="miner.status.offline.tag" /></span>;
    }
    return <span><FormattedMessage id="miner.status.pending" /></span>;
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
      title={title || <FormattedMessage id="miner.hashrate.current" />}
      bigFont={true}
      loading={loading}
      errors={errors}
      mainData={mainDataContent}
      secondaryData={
        currentStatus === 'online' && avgData?.value != null ? (
          <CountUp
            end={avgData.value}
            duration={1}
            decimals={2}
            suffix={` ${avgData.unit || ''}`}
            preserveValue
          />
        ) : (
          <span>N/A</span>
        )
      }
    />
  );
};

export default HashrateCard;
