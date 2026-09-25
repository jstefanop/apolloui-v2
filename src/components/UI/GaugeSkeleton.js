import { Flex, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

// The placeholder for a usage gauge: a value, a label, and the arc below them.
//
// Same reason as CardSkeleton — it used to be drawn by react-content-loader with
// its own grey, so two placeholders on one screen did not match, and neither
// followed the theme. Chakra's Skeleton takes its colours from the theme we
// define once, so these agree with every other placeholder by construction.
const GaugeSkeleton = () => (
  <Stack spacing={4} w="100%" py="10px">
    <Flex align="center" gap={3}>
      <SkeletonCircle size="40px" flexShrink={0} />
      <Stack spacing={2} flex="1" maxW="180px">
        <Skeleton height="20px" />
        <Skeleton height="10px" width="60%" />
      </Stack>
    </Flex>
    {/* The arc: a wide, short block where the half circle will be. */}
    <Skeleton height="70px" borderTopRadius="140px" borderBottomRadius="0" />
  </Stack>
);

export default GaugeSkeleton;
