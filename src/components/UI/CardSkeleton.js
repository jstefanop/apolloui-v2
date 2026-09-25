import { Flex, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

// The placeholder for a statistic card: a round icon and two lines, in the
// proportions of the thing it stands in for.
//
// It replaces the generic loaders from react-content-loader, which carried their
// own hardcoded palette — near-white on the dark theme, which made a loading
// dashboard the brightest thing on screen — and which sized themselves to the
// container rather than to the content, so a tall card got one enormous grey
// slab. Chakra's Skeleton takes its colours from the theme, so these follow
// light and dark without being told.
const CardSkeleton = ({ lines = 2, iconSize = '48px', ...props }) => (
  <Flex align="center" gap={4} width="100%" {...props}>
    <SkeletonCircle size={iconSize} flexShrink={0} />
    <Stack spacing={2} flex="1" maxW="260px">
      <Skeleton height="18px" />
      {lines > 1 && <Skeleton height="12px" width="60%" />}
      {lines > 2 && <Skeleton height="12px" width="40%" />}
    </Stack>
  </Flex>
);

export default CardSkeleton;
