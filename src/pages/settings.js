import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Flex } from '@chakra-ui/react';

const Settings = () => {
  const router = useRouter();
  const deviceType = process.env.NEXT_PUBLIC_DEVICE_TYPE;

  useEffect(() => {
    // Redirect to the appropriate default tab based on device type
    const defaultTab = deviceType === 'solo-node' ? 'node' : 'pools';
    router.replace(`/settings/${defaultTab}`);
  }, [router, deviceType]);

  return (
    <Box minH="calc(100vh - 80px)" display="flex" alignItems="center" justifyContent="center">
      <Flex direction="column" align="center" gap={4}>
        <Spinner size="xl" />
        <Box>Redirecting to settings...</Box>
      </Flex>
    </Box>
  );
};

export default Settings;
