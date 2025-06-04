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
  nodeOnline,
  minerOnline,
}) => {
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const badgeColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBox = useColorModeValue('gray.300', 'navy.800');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      flexWrap={'unset'}
      p="10px"
    >
      {/* Miner */}
      {type === 'miner' && (
        <Center>
          {(minerOnline === 'online' || minerOnline === 'pending') && (
            <>
              <Button
                ms="auto"
                p="6px"
                align="center"
                me="6px"
                bgColor={badgeBox}
                onClick={() => handleSystemAction('stopMiner')}
                isDisabled={minerOnline === 'pending'}
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
                  Stop
                </Text>
              </Button>

              <Button
                ms="auto"
                p="6px"
                align="center"
                me="6px"
                bgColor={badgeBox}
                onClick={() => handleSystemAction('restartMiner')}
                isDisabled={minerOnline === 'pending'}
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
                  Restart
                </Text>
              </Button>
            </>
          )}

          {minerOnline === 'offline' && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('startMiner')}
              isDisabled={minerOnline === 'pending'}
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
                Start
              </Text>
            </Button>
          )}
        </Center>
      )}

      {/* Node */}
      {type === 'node' && (
        <Center>
          {(nodeOnline === 'online' || nodeOnline === 'pending') && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('stopNode')}
              isDisabled={nodeOnline === 'pending'}
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
                Stop
              </Text>
            </Button>
          )}

          {nodeOnline === 'offline' && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              bgColor={badgeBox}
              onClick={() => handleSystemAction('startNode')}
              isDisabled={nodeOnline === 'pending'}
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
                Start
              </Text>
            </Button>
          )}
        </Center>
      )}
    </Flex>
  );
};

export default NavbarSeconday;
