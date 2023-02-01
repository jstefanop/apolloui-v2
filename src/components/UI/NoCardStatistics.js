// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';

const NoCardStatistics = ({ startContent, name, value, reversed, ...props }) => {
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'secondaryGray.600';

  return (
    <Flex
      my="15px"
      h="100%"
      align={{ base: 'center', xl: 'center' }}
      justify={{ base: 'center', xl: 'center' }}
      {...props}
    >
      {startContent}

      <Stat my="auto" ms={startContent ? '8px' : '0px'}>
        {reversed && (
          <StatLabel
            lineHeight="100%"
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name}
          </StatLabel>
        )}
        <StatNumber
          color={textColor}
          fontSize={{
            base: '2xl',
          }}
        >
          {value}
        </StatNumber>
        {!reversed && (
          <StatLabel
            lineHeight="100%"
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name}
          </StatLabel>
        )}
      </Stat>
    </Flex>
  );
};

export default NoCardStatistics;
