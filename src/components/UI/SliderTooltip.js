import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
} from '@chakra-ui/react';
import { useState } from 'react';

const SliderTooltip = ({
  sliderId,
  value,
  minValue,
  maxValue,
  step,
  ranges,
  sliderColor,
  tooltipBgColor,
  handleSliderChange,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentageValue = (100 * value) / maxValue;
  let progressColor = 'green';
  if (percentageValue > 60 && percentageValue < 75) {
    progressColor = 'orange';
  } else if (percentageValue >= 75) {
    progressColor = 'red';
  }
  if (sliderId.match(/fan/)) progressColor = 'gray';

  return (
    <Slider
      id={sliderId}
      defaultValue={minValue || 0}
      value={value}
      min={minValue || 0}
      max={maxValue || 100}
      step={step}
      colorScheme={progressColor || 'blue'}
      onChange={(v) => handleSliderChange(v)}
      onChangeStart={() => setShowTooltip(true)}
      onChangeEnd={() => setShowTooltip(false)}
      size='lg'
      {...props}
    >
      {Object.keys(ranges).map((key, index) => (
        <SliderMark key={index} value={key} mt='2' ml='-2.5' fontSize='xs'>
          {ranges[key]}
        </SliderMark>
      ))}
      <SliderTrack minH='6px' borderRadius='4px'>
        <SliderFilledTrack minH='8px' borderRadius='4px'/>
      </SliderTrack>
      <Tooltip
        hasArrow
        bg={tooltipBgColor || 'blue.500'}
        color='white'
        placement='top'
        isOpen={showTooltip}
        label={`${value}${(sliderId === 'voltage') ? '%' : (sliderId.match(/fan/)) ? '°' : ''}`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
};

export default SliderTooltip;
