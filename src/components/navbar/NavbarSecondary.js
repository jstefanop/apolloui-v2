// Chakra Imports
import {
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Center,
  Button,
} from '@chakra-ui/react';
import { RestartIcon } from '../UI/Icons/RestartIcon';
import { StopIcon } from '../UI/Icons/StopIcon';

const NavbarSeconday = ({
  type,
  handleSystemAction,
  blocksCount,
  minerOnline,
}) => {
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const badgeColor = useColorModeValue('gray.400', 'gray.300');
  const badgeBox = useColorModeValue('white', 'navy.800');
  const iconColor = useColorModeValue('gray.400', 'gray.300');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={'unset'}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      {type === 'miner' && (
        <Center>
          {minerOnline && (
            <>
              <Button
                ms="auto"
                p="6px"
                align="center"
                me="6px"
                bgColor={badgeBox}
                onClick={() => handleSystemAction('stopMiner')}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg={badgeBox}
                  h="32px"
                  w="32px"
                  borderRadius="30px"
                  me="7px"
                >
                  <Icon w="18px" h="18px" color={iconColor} as={StopIcon} />
                </Flex>
                <Text
                  w="max-content"
                  color={badgeColor}
                  fontSize="sm"
                  fontWeight="600"
                  me="6px"
                >
                  Stop miner
                </Text>
              </Button>

              <Button
                ms="auto"
                p="6px"
                align="center"
                me="6px"
                bgColor={badgeBox}
                onClick={() => handleSystemAction('restartMiner')}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg={badgeBox}
                  h="32px"
                  w="32px"
                  borderRadius="30px"
                  me="7px"
                >
                  <Icon w="18px" h="18px" color={iconColor} as={RestartIcon} />
                </Flex>
                <Text
                  w="max-content"
                  color={badgeColor}
                  fontSize="sm"
                  fontWeight="600"
                  me="6px"
                >
                  Restart miner
                </Text>
              </Button>
            </>
          )}

          {!minerOnline && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('startMiner')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="32px"
                w="32px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="18px" h="18px" color={iconColor} as={RestartIcon} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="600"
                me="6px"
              >
                Start miner
              </Text>
            </Button>
          )}
        </Center>
      )}

      {type === 'node' && (
        <Center>
          {blocksCount && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('stopNode')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="32px"
                w="32px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="18px" h="18px" color={iconColor} as={StopIcon} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="600"
                me="6px"
              >
                Stop Node
              </Text>
            </Button>
          )}

          {!blocksCount && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('startNode')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="32px"
                w="32px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="18px" h="18px" color={iconColor} as={RestartIcon} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="600"
                me="6px"
              >
                Start Node
              </Text>
            </Button>
          )}
        </Center>
      )}
    </Flex>
  );
};

export default NavbarSeconday;
