// Chakra Imports
import {
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Center,
  Button,
} from '@chakra-ui/react';
import React from 'react';
// Assets
import { MdCheckCircle, MdCancel } from 'react-icons/md';

const NavbarSeconday = ({
  type,
  handleSystemAction,
  nodeNetworkInfo,
  minerOnline,
}) => {
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const badgeColor = useColorModeValue('gray.700', 'white');
  const badgeBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const badgeBox = useColorModeValue('white', 'navy.800');
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
                onClick={() => handleSystemAction('stopMiner')}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg={badgeBox}
                  h="29px"
                  w="29px"
                  borderRadius="30px"
                  me="7px"
                >
                  <Icon
                    w="24px"
                    h="24px"
                    color={'gray.500'}
                    as={MdCheckCircle}
                  />
                </Flex>
                <Text
                  w="max-content"
                  color={badgeColor}
                  fontSize="sm"
                  fontWeight="700"
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
                onClick={() => handleSystemAction('restartMiner')}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg={badgeBox}
                  h="29px"
                  w="29px"
                  borderRadius="30px"
                  me="7px"
                >
                  <Icon
                    w="24px"
                    h="24px"
                    color={'gray.500'}
                    as={MdCheckCircle}
                  />
                </Flex>
                <Text
                  w="max-content"
                  color={badgeColor}
                  fontSize="sm"
                  fontWeight="700"
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
              onClick={() => handleSystemAction('startMiner')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="29px"
                w="29px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="24px" h="24px" color={'gray.500'} as={MdCheckCircle} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="700"
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
          {nodeNetworkInfo && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              onClick={() => handleSystemAction('stopNode')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="29px"
                w="29px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="24px" h="24px" color={'gray.500'} as={MdCheckCircle} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="700"
                me="6px"
              >
                Stop Node
              </Text>
            </Button>
          )}

          {!nodeNetworkInfo && (
            <Button
              ms="auto"
              p="6px"
              align="center"
              me="6px"
              onClick={() => handleSystemAction('startNode')}
            >
              <Flex
                align="center"
                justify="center"
                bg={badgeBox}
                h="29px"
                w="29px"
                borderRadius="30px"
                me="7px"
              >
                <Icon w="24px" h="24px" color={'gray.500'} as={MdCheckCircle} />
              </Flex>
              <Text
                w="max-content"
                color={badgeColor}
                fontSize="sm"
                fontWeight="700"
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
