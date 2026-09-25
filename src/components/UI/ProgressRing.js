import { Box, Flex, useColorModeValue, useToken } from '@chakra-ui/react';

// A ring that fills, drawn in the space an icon would occupy.
//
// It exists so a card carrying a proportion is the same height as the cards
// beside it: a progress bar needs its own row under the value, and the one card
// in a row of four that grew taller was the first thing the eye landed on. The
// icon slot is already there, already aligned, and otherwise says nothing the
// label below it does not.
//
// Drawn rather than pulled from a chart library, for the same reason as the
// gauges and the area charts: this is two circles, and the controllers have no
// GPU driver to rasterise anything heavier.
//
// Plain SVG elements, and the colours resolved through useToken first: Chakra
// reads a bare number on `width` as a spacing token, so a <Box as="svg"
// width={56}> is 14rem across — a ring four times the size of the card it sits
// in, drawn over everything below it.
const ProgressRing = ({
  percent = 0,
  size = 56,
  stroke = 4,
  color,
  trackColor,
  children,
  ...props
}) => {
  // brand.500 is #2C3674 in this theme — a dark indigo that vanishes into a
  // navy card. The lighter brand is the one the progress bars already use.
  const defaultFill = useColorModeValue('brand.500', 'brand.400');
  const fallbackTrack = useColorModeValue('secondaryGray.400', 'whiteAlpha.300');
  const [fill, track] = useToken('colors', [
    color || defaultFill,
    trackColor || fallbackTrack,
  ]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // A reading outside the dial is a fault upstream; clamp rather than draw an
  // arc that wraps back over itself.
  const filled = Math.min(Math.max(Number(percent) || 0, 0), 100);

  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0} {...props}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        // Start at twelve o'clock instead of three.
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled / 100)}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <Flex position="absolute" inset="0" align="center" justify="center">
        {children}
      </Flex>
    </Box>
  );
};

export default ProgressRing;
