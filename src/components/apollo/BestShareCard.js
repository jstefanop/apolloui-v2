import { useColorModeValue } from '@chakra-ui/system';
import CountUp from 'react-countup';
import { BlocksIcon } from '../UI/Icons/BlocksIcon';
import TileCard from '../UI/TileCard';
import { FormattedMessage } from 'react-intl';
import { fitTextSize } from '../../lib/utils';
import moment from '../../lib/moment';

// The same grouping react-countup uses for the figure above, so the two can be
// read against each other. Spelling the record out in words — which is what
// this slot used to do for the session figure — hid whether it was the same
// number or a different one.
const grouped = (value) => Number(value).toLocaleString('en-US');

// The big figure is ckpool's, and it counts the current run: every restart of
// the pool puts it back to zero. `bestEver` is ours, kept in the database, and
// only ever rises — so the two belong on the same card, the session above and
// the record below.
const BestShare = ({
  shadow,
  iconColor,
  loading,
  errors,
  data,
  bestEver,
}) => {
  const cardColor = useColorModeValue(
    'linear-gradient(135deg, #EE1C26 0%, #080C0C 100%)',
    'linear-gradient(135deg, #EE1C26 20%, #080C0C 100%)'
  );
  // Sized from the value it is counting up to, not from the digits on screen at
  // this instant: taking the running figure would resize the text on every
  // frame of the animation.
  const mainFontSize =
    data != null ? fitTextSize(grouped(data).length) : undefined;
  // Tied to the same width and scaled down, so the record stays the smaller of
  // the two however long either of them gets.
  const everFontSize = bestEver?.value
    ? fitTextSize(grouped(bestEver.value).length, {
        max: '1.5rem',
        min: '0.8rem',
        scale: 0.62,
      })
    : undefined;

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
      mainFontSize={mainFontSize}
      secondaryFontSize={everFontSize}
      mainCaption={
        <FormattedMessage
          id="solo_mining.stats.best_share_session"
          defaultMessage="This session"
        />
      }
      secondaryTextColor={secondaryColor}
      secondaryText={
        <>
          <FormattedMessage
            id="solo_mining.stats.best_share_ever"
            defaultMessage="Best share ever"
          />
          {bestEver?.at ? ` · ${moment(bestEver.at).format('ll')}` : ''}
        </>
      }
      mainData={
        data !== null && data !== undefined ? (
          <CountUp
            end={data || 0}
            duration={1}
            decimals={0}
            suffix={``}
            preserveValue
          />
        ) : (
          <span>N/A</span>
        )
      }
      secondaryData={bestEver?.value ? grouped(bestEver.value) : <span>N/A</span>}
      loading={loading}
      errors={errors}
    />
  );
};

export default BestShare;
