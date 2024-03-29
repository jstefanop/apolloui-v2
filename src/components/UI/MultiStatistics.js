// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from '../card/Card';

const MultiStatistics = ({
  bgColor,
  startContent,
  endContent,
  reversed,
  name,
  value,
  name2,
  value2,
  name3,
  value3,
  fontSize,
  ...props
}) => {
  const textColor = useColorModeValue('brand.800', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.1)'
  );

  return (
    <Card py="15px" bg={bgColor} shadow={shadow} {...props}>
      <Flex
        justify={{ base: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        {startContent}

        <Stat ms={startContent ? '18px' : '0px'}>
          {reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: fontSize || '2xl',
              }}
            >
              {value}
            </StatNumber>
          )}
          <StatLabel
            lineHeight="100%"
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name}
          </StatLabel>
          {!reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: fontSize || '2xl',
              }}
            >
              {value}
            </StatNumber>
          )}
        </Stat>
        <Flex ms="auto" w="max-content" display={{ base: 'none', md: 'block'}}>
          <Stat ms={startContent ? '18px' : '0px'}>
            {reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
              >
                {value2}
              </StatNumber>
            )}
            <StatLabel
              lineHeight="100%"
              color={textColorSecondary}
              fontSize={{
                base: 'sm',
              }}
            >
              {name2}
            </StatLabel>
            {!reversed && (
              <StatNumber
                color={textColor}
                fontSize={{
                  base: fontSize || '2xl',
                }}
              >
                {value2}
              </StatNumber>
            )}
          </Stat>
        </Flex>
      </Flex>
      <Flex ml="56px" mt="3">
        <Stat ms={startContent ? '18px' : '0px'}>
          {reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: fontSize || '2xl',
              }}
            >
              {value3}
            </StatNumber>
          )}
          <StatLabel
            lineHeight="100%"
            color={textColorSecondary}
            fontSize={{
              base: 'sm',
            }}
          >
            {name3}
          </StatLabel>
          {!reversed && (
            <StatNumber
              color={textColor}
              fontSize={{
                base: fontSize || '2xl',
              }}
            >
              {value3}
            </StatNumber>
          )}
        </Stat>
      </Flex>
    </Card>
  );
};

export default MultiStatistics;
