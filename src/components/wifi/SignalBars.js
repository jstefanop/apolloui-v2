import { Flex, Box, useColorModeValue } from '@chakra-ui/react';

// Four bars, filled by strength. The panel this replaces picked between three
// icons on thresholds that were inverted for the two weakest bands, so a poor
// signal drew a fuller icon than a fair one.
const LEVELS = [
  { min: 75, bars: 4 },
  { min: 50, bars: 3 },
  { min: 25, bars: 2 },
  { min: 0, bars: 1 },
];

const barsFor = (signal) =>
  LEVELS.find((l) => (signal ?? 0) >= l.min)?.bars ?? 1;

const SignalBars = ({ signal, ...props }) => {
  const on = useColorModeValue('gray.700', 'white');
  const off = useColorModeValue('gray.300', 'whiteAlpha.300');
  const filled = barsFor(signal);

  return (
    <Flex align="flex-end" gap="2px" h="16px" {...props}>
      {[1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          w="3px"
          h={`${i * 4}px`}
          borderRadius="1px"
          bg={i <= filled ? on : off}
        />
      ))}
    </Flex>
  );
};

export { barsFor };
export default SignalBars;
