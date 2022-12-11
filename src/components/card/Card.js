import { Box, useStyleConfig } from '@chakra-ui/react';

const Card = (props) => {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig('Card', { variant });

  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
}

export default Card;
