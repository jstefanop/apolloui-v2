import { CheckIcon } from '@chakra-ui/icons';
import { Icon, Flex, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import ActiveBadge from '../apollo/ActiveBadge';
import { ErrorIcon } from './Icons/ErrorIcon';

const PanelGrid = ({
  title,
  active,
  total,
  data,
  status,
  badgeText,
  badgeSecondaryText,
}) => {
  const badgeBgColor = useColorModeValue('gray.200', 'gray.900');
  return (
    <Flex mt="4" mx="5" direction="column">
      <Flex justify="space-between">
        <Flex m="2">
          <Text fontSize="md" fontWeight="600">
            {title}
          </Text>
        </Flex>
        {active && total && (
          <ActiveBadge active={active} total={total} title="Active" />
        )}
        <Flex>
          {status && (
            <Flex align="center">
              <Flex
                align="center"
                justify="center"
                bg={status ? 'green.500' : 'red.500'}
                h="20px"
                w="20px"
                borderRadius="30px"
              >
                <Icon
                  w="12px"
                  h="12px"
                  color="white"
                  as={status ? CheckIcon : ErrorIcon}
                />
              </Flex>
              <Text mx="3" fontWeight={600} fontSize="sm">
                {status ? 'Active' : 'Inactive'}
              </Text>
            </Flex>
          )}
          {(badgeText || badgeSecondaryText) && (
            <Flex
              bgColor={badgeBgColor}
              borderRadius={'12px'}
              ms="auto"
              p={'3px'}
              px={'10px'}
              align="center"
            >
              {badgeText && (
                <Text fontWeight="800" fontSize="sm">
                  {badgeText}
                </Text>
              )}
              {badgeSecondaryText && (
                <Text fontWeight="500" fontSize="sm" ml="2" color="gray.500">
                  {badgeSecondaryText}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
      <SimpleGrid columns={3} spacing={0} my="2" ml="2">
        {data.map((item, index) =>
          !item.value ? (
            <span key={index}></span>
          ) : (
            <Flex align="center" mb="4" key={index}>
              <Icon as={item.icon} me="3" w="18px" h="18px" />
              <Text fontWeight="600" minWidth="100px">
                {item.value}
              </Text>
            </Flex>
          )
        )}
      </SimpleGrid>
    </Flex>
  );
};

export default PanelGrid;
