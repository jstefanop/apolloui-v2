// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';

const NoCardStatistics = ({
  startContent,
  name,
  value,
  ...props
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
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
        <StatNumber
          color={textColor}
          fontSize={{
            base: '2xl',
          }}
        >
          {value}
        </StatNumber>
        <StatLabel
          lineHeight="100%"
          color={textColorSecondary}
          fontSize={{
            base: 'sm',
          }}
        >
          {name}
        </StatLabel>
      </Stat>
    </Flex>
  );
};

export default NoCardStatistics;
