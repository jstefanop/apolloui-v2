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
  prevData,
  prevAvgData,
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

  // Determine the appropriate icon for the TileCard
  const tileCardIcon = (() => {
    if (status === 'offline') return MdOfflineBolt;
    if (status === 'pending') return Spinner;
    return PowerIcon;
  })();

  // Determine what to display in the main data section
  const mainDataContent = (() => {
    if (status === 'online' && data !== null && data !== undefined) {
      return (
        <CountUp
          start={prevData || 0}
          end={data || 0}
          duration={1}
          decimals={0}
          suffix={` Watts`}
          enableScrollSpy
          scrollSpyOnce
        >
          {({ countUpRef }) => <span ref={countUpRef} />}
        </CountUp>
      );
    } else if (status === 'offline') {
      return <span><FormattedMessage id="miner.status.offline.tag" /></span>;
    } else if (status === 'pending') {
      return <span><FormattedMessage id="miner.status.pending" /></span>;
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
        status === 'online' && avgData !== null && avgData !== undefined ? (
          <CountUp
            start={prevAvgData || 0}
            end={avgData || 0}
            duration={1}
            decimals={2}
            suffix=""
            enableScrollSpy
            scrollSpyOnce
          >
            {({ countUpRef }) => <span ref={countUpRef} />}
          </CountUp>
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
