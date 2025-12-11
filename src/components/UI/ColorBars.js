import { Box, Flex, Tooltip, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { dailyChanceRanges } from '../../lib/utils';

const ColorBars = ({ bars, barWidth = '2px', barHeight = '16px', gap = '1', currentValue }) => {
  const tooltipBg = useColorModeValue('gray.100', 'gray.700');
  const tooltipColor = useColorModeValue('gray.800', 'white');
  const highlightBg = useColorModeValue('gray.400', 'gray.600');

  const legendContent = (
    <VStack align="start" spacing={1} p={2}>
      {dailyChanceRanges.map((item, index) => {
        const isCurrentLevel = currentValue && currentValue <= item.max && 
          (index === 0 || currentValue > dailyChanceRanges[index - 1].max);
        
        return (
          <Flex 
            key={index} 
            align="center" 
            gap={2}
            bg={isCurrentLevel ? highlightBg : 'transparent'}
            px={2}
            py={1}
            borderRadius="md"
            w="100%"
          >
            <Flex gap="1px">
              {Array(5).fill('').map((_, i) => (
                <Box
                  key={i}
                  w="1px"
                  h="8px"
                  bg={i < item.bars ? item.color : 'gray.500'}
                  borderRadius="full"
                />
              ))}
            </Flex>
            <Text fontSize="xs">
              1 in {item.max === Infinity ? '> 10,000,000' : `≤ ${item.max.toLocaleString('en-US')}`}
            </Text>
          </Flex>
        );
      })}
    </VStack>
  );

  return (
    <Tooltip
      label={legendContent}
      placement="top"
      hasArrow
      bg={tooltipBg}
      color={tooltipColor}
      p={0}
    >
      <Flex gap={gap}>
        {bars.map((barColor, index) => (
          <Box
            key={index}
            w={barWidth}
            h={barHeight}
            bg={barColor}
            borderRadius="full"
            transition="all 0.2s"
          />
        ))}
      </Flex>
    </Tooltip>
  );
};

export default ColorBars; 