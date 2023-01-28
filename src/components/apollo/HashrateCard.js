import { useColorModeValue } from '@chakra-ui/system';
import CountUp from 'react-countup';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import TileCard from '../UI/TileCard';

const HashrateCard = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  avgData,
  prevData,
  prevAvgData,
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

  return (
    <TileCard
      className={'banner-hashrate'}
      boxShadow={shadow}
      bgGradient={hashCardColor}
      icon={MinerIcon}
      iconColor={iconColor}
      iconBgColor={'linear-gradient(290.56deg, #454D76 7.51%, #25283E 60.45%)'}
      secondaryTextColor={hashSecondaryColor}
      secondaryText="15 minutes average"
      title="Current hashrate"
      loading={loading}
      errors={errors}
      mainData={
        <CountUp
          start={prevData?.value || 0}
          end={data?.value}
          duration="1"
          decimals="2"
          suffix={` ${data?.unit}`}
        />
      }
      secondaryData={
        avgData && <CountUp
          start={prevAvgData?.value || 0}
          end={avgData?.value}
          duration="1"
          decimals="2"
          suffix={` ${avgData?.unit}`}
        /> 
      }
    />
  );
};

export default HashrateCard;