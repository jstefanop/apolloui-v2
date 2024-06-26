import { useColorModeValue } from '@chakra-ui/system';
import CountUp from 'react-countup';
import { PowerIcon } from '../UI/Icons/PowerIcon';
import TileCard from '../UI/TileCard';
import BannerPower from '../../assets/img/powerusage_banner.png';

const PowerCard = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  avgData,
  prevData,
  prevAvgData,
}) => {
  const powerCardColor = useColorModeValue(
    'linear-gradient(135deg, #485C7B 0%, #080C0C 100%)',
    'linear-gradient(135deg, #485C7B 20%, #080C0C 100%)'
  );
  const powerSecondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );
  const powerIconBgColor = useColorModeValue('gray.600', 'white');

  return (
    <TileCard
      bannerImage={BannerPower}
      boxShadow={shadow}
      bgGradient={powerCardColor}
      icon={PowerIcon}
      iconColor={iconColor}
      iconBgColor="linear-gradient(290.56deg, #455976 22.69%, #0B0F10 60.45%)"
      title="Power usage"
      secondaryTextColor={powerSecondaryColor}
      secondaryText="Watts per TH/s"
      mainData={
        <CountUp
          start={prevData || 0}
          end={data}
          duration="1"
          decimals="0"
          suffix={` Watts`}
        />
      }
      secondaryData={
        avgData && (
          <CountUp
            start={prevAvgData || 0}
            end={avgData || 0}
            duration="1"
            decimals="0"
          />
        )
      }
      loading={loading}
      errors={errors}
    />
  );
};

export default PowerCard;
