import { useColorModeValue } from '@chakra-ui/system';
import CountUp from 'react-countup';
import { BlocksIcon } from '../UI/Icons/BlocksIcon';
import TileCard from '../UI/TileCard';

const BestShare = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  avgData,
  prevData,
  prevAvgData,
}) => {
  const cardColor = useColorModeValue(
    'linear-gradient(135deg, #EE1C26 0%, #080C0C 100%)',
    'linear-gradient(135deg, #EE1C26 20%, #080C0C 100%)'
  );
  const secondaryColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.200'
  );

  return (
    <TileCard
      boxShadow={shadow}
      bgGradient={cardColor}
      icon={BlocksIcon}
      iconColor={iconColor}
      iconBgColor="linear-gradient(290.56deg, #70191c 28.69%, #9b2226 60.45%)"
      title="Best share"
      secondaryTextColor={secondaryColor}
      secondaryText="Best Share % to solve block"
      mainData={
        <CountUp
          start={prevData || 0}
          end={data}
          duration="1"
          decimals="0"
          suffix={``}
        />
      }
      secondaryData={
        avgData && (
          <CountUp
            start={prevAvgData || 0}
            end={avgData}
            duration="1"
            decimals="6"
            suffix={`%`}
          />
        )
      }
      loading={loading}
      errors={errors}
    />
  );
};

export default BestShare;
