import { mode } from '@chakra-ui/theme-tools';

// One definition for every placeholder in the app.
//
// Without it each caller inherited Chakra's defaults, which on the dark theme
// come out as near-white slabs — brighter than anything else on the page, so a
// loading dashboard read as broken. Worse, the ones drawn by hand elsewhere were
// grey, so two placeholders sat side by side in different colours.
//
// The values are the card surface, lifted just enough to read as "something goes
// here": a placeholder should recede, not announce itself.
export const skeletonStyles = {
  components: {
    Skeleton: {
      baseStyle: (props) => ({
        borderRadius: '8px',
        opacity: mode(1, 0.55)(props),
        '--skeleton-start-color': mode(
          'var(--chakra-colors-secondaryGray-300)',
          'var(--chakra-colors-navy-700)'
        )(props),
        '--skeleton-end-color': mode(
          'var(--chakra-colors-secondaryGray-400)',
          'var(--chakra-colors-navy-600)'
        )(props),
      }),
    },
  },
};
