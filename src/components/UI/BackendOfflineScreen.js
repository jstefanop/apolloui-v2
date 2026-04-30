import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  Link,
  Spinner,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { WarningTwoIcon, RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const portApi = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 5000;

function getHealthUrl() {
  if (typeof window === 'undefined') return null;
  return `http://${window.location.hostname}:${portApi}/health`;
}

// Elapsed seconds counter — updates every second while visible.
function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
}

function formatElapsed(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export default function BackendOfflineScreen({ onRetry }) {
  const elapsed = useElapsed();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Give a visual flash then call the parent callback (page reload)
    setTimeout(() => {
      setRetrying(false);
      if (onRetry) onRetry();
    }, 800);
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      bg="linear-gradient(135deg, #0b1437 0%, #111c44 60%, #0b1437 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Subtle animated grid texture */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.04}
        backgroundImage="radial-gradient(circle, #ffffff 1px, transparent 1px)"
        backgroundSize="32px 32px"
        pointerEvents="none"
      />

      <VStack spacing={8} maxW="460px" w="full" px={6} position="relative">
        {/* Icon */}
        <Flex
          w="80px"
          h="80px"
          borderRadius="full"
          bg="whiteAlpha.100"
          align="center"
          justify="center"
          border="2px solid"
          borderColor="orange.500"
        >
          <Icon as={WarningTwoIcon} w={8} h={8} color="orange.400" />
        </Flex>

        {/* Title */}
        <VStack spacing={2} textAlign="center">
          <Heading
            size="lg"
            color="white"
            fontWeight="700"
            letterSpacing="-0.02em"
          >
            Backend offline
          </Heading>
          <Text color="whiteAlpha.600" fontSize="sm" lineHeight="1.6">
            Cannot reach the Apollo API service. Check that the backend
            is running and that your device is on the same network.
          </Text>
        </VStack>

        <Divider borderColor="whiteAlpha.100" />

        {/* Status row */}
        <HStack
          w="full"
          bg="whiteAlpha.50"
          borderRadius="xl"
          px={5}
          py={4}
          justify="space-between"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HStack spacing={3}>
            <Spinner size="sm" color="orange.400" speed="0.9s" />
            <Text color="whiteAlpha.700" fontSize="sm">
              Trying to reconnect…
            </Text>
          </HStack>
          <Badge
            colorScheme="orange"
            variant="subtle"
            borderRadius="md"
            fontSize="xs"
            px={2}
          >
            {formatElapsed(elapsed)}
          </Badge>
        </HStack>

        {/* Suggestions */}
        <VStack
          spacing={2}
          w="full"
          bg="whiteAlpha.50"
          borderRadius="xl"
          px={5}
          py={4}
          align="flex-start"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Text color="whiteAlpha.500" fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
            Troubleshooting
          </Text>
          {[
            {
              text: 'Verify the Apollo API service is running',
              link: getHealthUrl(),
              linkLabel: '/health',
            },
            { text: 'Check that your device is connected to the local network' },
            { text: 'Try rebooting your device' },
          ].map(({ text, link, linkLabel }) => (
            <HStack key={text} spacing={2} align="flex-start">
              <Text color="whiteAlpha.400" fontSize="sm" mt="1px">•</Text>
              <Text color="whiteAlpha.600" fontSize="sm" lineHeight="1.5">
                {text}{link && (
                  <>
                    {' — '}
                    <Link
                      href={link}
                      isExternal
                      color="orange.300"
                      _hover={{ color: 'orange.200', textDecoration: 'underline' }}
                    >
                      {linkLabel} <ExternalLinkIcon mx="2px" mb="2px" boxSize="10px" />
                    </Link>
                  </>
                )}
              </Text>
            </HStack>
          ))}
        </VStack>

        {/* Retry button */}
        <Button
          leftIcon={<RepeatIcon />}
          colorScheme="orange"
          variant="solid"
          size="md"
          borderRadius="xl"
          w="full"
          isLoading={retrying}
          loadingText="Retrying…"
          onClick={handleRetry}
          _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
          transition="all 0.15s"
        >
          Retry now
        </Button>

        {/* Branding */}
        <Text color="whiteAlpha.200" fontSize="xs">
          FutureBit Apollo
        </Text>
      </VStack>
    </Box>
  );
}
