// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';

const NoCardStatistics = ({ startContent, name, value, reversed, ...props }) => {
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'secondaryGray.600';

  // Check if value is a React element (not just a string/number)
  const isComplexValue = React.isValidElement(value);

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
          noOfLines={isComplexValue ? undefined : 1}
          overflow={isComplexValue ? "visible" : undefined}
          whiteSpace={isComplexValue ? "normal" : undefined}
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
