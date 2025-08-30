import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Flex } from '@chakra-ui/react';

const Settings = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first tab (pools) when accessing /settings
    router.replace('/settings/pools');
  }, [router]);

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
