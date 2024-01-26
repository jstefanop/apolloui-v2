/* eslint-disable */
import React from 'react';
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SidebarLinks = ({ routes, onClose }) => {
  const router = useRouter();
  //   Chakra color mode
  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.600'
  );
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return router.pathname.includes(routeName);
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        return (
          <div key={index}>
            <Text
              fontSize={'md'}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{
                sm: '10px',
                xl: '16px',
              }}
              pt="18px"
              pb="12px"
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </div>
        );
      } else if (
        route.layout === '/admin' ||
        route.layout === '/auth' ||
        route.layout === '/rtl'
      ) {
        return (
          <div key={index}>
            {route.icon ? (
              <Box>
                <Link href={route.path} onClick={onClose}>
                  <HStack
                    spacing={
                      activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                    }
                    py="5px"
                    ps="10px"
                  >
                    <Flex w="100%" alignItems="center" justifyContent="center" h="36px">
                      <Box
                        color={
                          activeRoute(route.path.toLowerCase())
                            ? activeIcon
                            : textColor
                        }
                        me="18px"
                      >
                        {route.icon}
                      </Box>
                      <Text
                        me="auto"
                        color={
                          activeRoute(route.path.toLowerCase())
                            ? activeColor
                            : textColor
                        }
                        fontWeight={
                          activeRoute(route.path.toLowerCase())
                            ? 'bold'
                            : 'normal'
                        }
                      >
                        {route.name}
                      </Text>
                    </Flex>

                    <Box
                      h="36px"
                      w="4px"
                      bg={
                        activeRoute(route.path.toLowerCase())
                          ? brandColor
                          : 'transparent'
                      }
                      borderRadius="5px"
                    />
                  </HStack>
                </Link>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                  }
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </div>
        );
      }
    });
  };
  //  BRAND
  return createLinks(routes);
};

export default SidebarLinks;
