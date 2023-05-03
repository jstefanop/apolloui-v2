import { Icon, Flex, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { ErrorIcon } from '../UI/Icons/ErrorIcon';
import { WarningIcon } from '../UI/Icons/WarningIcon';

const ActiveBadge = ({ active, total, title, smaller, ...props }) => {
  return (
    <Flex
      {...props}
      bgColor={
        active && active === total
          ? 'green.500'
          : active && active !== total
          ? 'orange.500'
          : 'red.500'
      }
      color={active ? 'brand.800' : 'white'}
      borderRadius={smaller ? '4px' : '8px'}
      ms="auto"
      p={smaller ? '3px' : '6px'}
      px={smaller ? '10px' : '12px'}
      align="center"
    >
      <Icon
        w={smaller ? '12px' : '18px'}
        h={smaller ? '12px' : '18px'}
        mr="3"
        color="white"
        as={
          active && active === total
            ? CheckIcon
            : active && active !== total
            ? WarningIcon
            : ErrorIcon
        }
      />
      <Text fontWeight="600">
        {title} {`${active}/${total}`}
      </Text>
    </Flex>
  );
};

export default ActiveBadge;
