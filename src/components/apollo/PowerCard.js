import { useColorModeValue } from '@chakra-ui/system';
import { Spinner } from '@chakra-ui/react';
import CountUp from 'react-countup';
import { MdOfflineBolt } from 'react-icons/md';
import { PowerIcon } from '../UI/Icons/PowerIcon';
import TileCard from '../UI/TileCard';
import BannerPower from '../../assets/img/powerusage_banner.png';
import { FormattedMessage } from 'react-intl';

const PowerCard = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  avgData,
  serviceStatus,
}) => {
  const powerCardColor = useColorModeValue(
    'linear-gradient(135deg, #485C7B 0%, #080C0C 100%)',
    'linear-gradient(135deg, #485C7B 20%, #080C0C 100%)'
  );
  const powerSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );

  const { status } = serviceStatus?.miner || {};

  const tileCardIcon = (() => {
    if (status === 'offline') return MdOfflineBolt;
    if (status === 'pending') return Spinner;
    return PowerIcon;
  })();

  const mainDataContent = (() => {
    if (status === 'online' && data != null) {
      return (
        <CountUp
          end={data}
          duration={1}
          decimals={0}
          suffix={` Watts`}
          preserveValue
        />
      );
    }
    if (status === 'offline') {
      return <span><FormattedMessage id="miner.status.offline.tag" /></span>;
    }
    return <span><FormattedMessage id="miner.status.pending" /></span>;
  })();

  return (
    <TileCard
      bannerImage={BannerPower}
      boxShadow={shadow}
      bgGradient={powerCardColor}
      icon={tileCardIcon}
      iconColor={iconColor}
      iconBgColor="linear-gradient(290.56deg, #455976 22.69%, #0B0F10 60.45%)"
      title={<FormattedMessage id="miner.power.usage" />}
      secondaryTextColor={powerSecondaryColor}
      secondaryText={<FormattedMessage id="miner.power.watts_per_th" />}
      mainData={mainDataContent}
      secondaryData={
        status === 'online' && avgData != null ? (
          <CountUp
            end={avgData}
            duration={1}
            decimals={2}
            suffix=""
            preserveValue
          />
        ) : (
          <span>N/A</span>
        )
      }
      loading={loading}
      errors={errors}
    />
  );
};

export default PowerCard;
