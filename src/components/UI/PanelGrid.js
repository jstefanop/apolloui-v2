import { CheckIcon } from '@chakra-ui/icons';
import {
  Icon,
  Flex,
  Text,
  SimpleGrid,
  useColorModeValue,
  Tag,
  Box,
} from '@chakra-ui/react';
import ActiveBadge from '../apollo/ActiveBadge';
import { ErrorIcon } from './Icons/ErrorIcon';
import { getMinerHashboardType } from '../../lib/utils';

const PanelGrid = ({
  title,
  active,
  total,
  data,
  status,
  version,
  comport,
  badgeText,
  badgeSecondaryText,
  showName,
}) => {
  const badgeBgColor = useColorModeValue('gray.200', 'gray.900');
  const tagColor = useColorModeValue('gray.800', 'gray.200');
  const tagBgColor = useColorModeValue('gray.200', 'gray.600');
  const versionsMap = {
    v1: { color: 'blue', name: 'Apollo BTC' },
    v2: { color: 'teal', name: 'Apollo II' },
  };

  return (
    <Flex mt="4" mx="5" direction="column">
      <Flex justify="space-between" direction={{ base: 'column', md: 'row' }}>
        <Flex direction={{ base: 'column', md: 'row' }}>
          {title && (
            <Text fontSize="md" fontWeight="600">
              {title}
            </Text>
          )}
          {version && (
            <Tag
              size="md"
              colorScheme={versionsMap[version]?.color}
              my={{ base: '1', md: '0' }}
              ml={{ base: '0', md: '2' }}
            >
              {versionsMap[version]?.name}
            </Tag>
          )}
          {comport && (
            <Tag
              size="md"
              color={tagColor}
              bg={tagBgColor}
              my={{ base: '1', md: '0' }}
              ml={{ base: '0', md: '2' }}
            >
              {getMinerHashboardType(comport)}
            </Tag>
          )}
        </Flex>
        {typeof active !== 'undefined' &&
          active !== null &&
          typeof total !== 'undefined' &&
          total !== null && (
            <ActiveBadge active={active} total={total} title="Active" />
          )}
        <Flex my={{ base: '3', md: '0' }}>
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
      {data && data.length && (
        <SimpleGrid columns={{ base: '1', xl: '2' }} spacing={8} my="5" ml="2">
          {data.map((item, index) =>
            item.value !== null && item.value !== undefined && (
              <Flex align="center" mb="4" key={index}>
                <Icon as={item.icon} me="3" w="18px" h="18px" />
                {showName && (
                  <Box fontWeight="400" color="gray.500" me="3">
                    {item.name}
                  </Box>
                )}
                <Box fontWeight="600" minWidth="100px">
                  {item.value}
                </Box>
              </Flex>
            )
          )}
        </SimpleGrid>
      )}
    </Flex>
  );
};

export default PanelGrid;
