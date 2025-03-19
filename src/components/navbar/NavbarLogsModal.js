import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  Box,
  Code,
  Select,
  Spinner,
  useColorModeValue,
  Tooltip,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { LOGS_READ_QUERY } from '../../graphql/logs';
import { updateLogs } from '../../redux/slices/logsSlice';
import { MdRefresh, MdContentCopy } from 'react-icons/md';
import moment from 'moment';

const LOG_TYPES = [
  { value: 'CKPOOL', label: 'CK Pool' },
  { value: 'MINER', label: 'Bitcoin Miner' },
  { value: 'NODE', label: 'Bitcoin Node' },
];

const NavbarLogsModal = ({ isOpen, onClose }) => {
  const [logType, setLogType] = useState('CKPOOL');
  const [lines, setLines] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const logContainerRef = useRef(null);
  const dispatch = useDispatch();

  const codeBackground = useColorModeValue('gray.50', 'gray.800');
  const modalBgColor = useColorModeValue('gray.300', 'gray.700');
  const refreshInterval = 5000;
  let intervalRef = useRef(null);

  const [getLogs, { loading, error, data }] = useLazyQuery(LOGS_READ_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      // Update Redux store with logs data
      dispatch(
        updateLogs({
          data,
          loading: false,
          error: null,
        })
      );
    },
    onError: (error) => {
      dispatch(
        updateLogs({
          data: null,
          loading: false,
          error,
        })
      );
    },
  });

  const fetchLogs = () => {
    setIsLoadingLogs(true);

    // Simulate minimum loading time of 1 second
    const startTime = Date.now();

    getLogs({
      variables: {
        input: {
          logType,
          lines,
        },
      },
      onCompleted: () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);

        setTimeout(() => {
          setIsLoadingLogs(false);
        }, remainingTime);
      },
      onError: () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);

        setTimeout(() => {
          setIsLoadingLogs(false);
        }, remainingTime);
      },
    });
  };

  // Start auto-refresh when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLogs();

      if (autoRefresh) {
        intervalRef.current = setInterval(fetchLogs, refreshInterval);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, logType, lines, autoRefresh]);

  // Handle auto-refresh toggle
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOpen && autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, refreshInterval);
    }
  }, [autoRefresh]);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data]);

  const handleCopyLogs = () => {
    const content = data?.Logs?.read?.result?.content;
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const logContent = data?.Logs?.read?.result?.content || '';
  const timestamp = data?.Logs?.read?.result?.timestamp
    ? moment(data.Logs.read.result.timestamp).format('YYYY-MM-DD HH:mm:ss')
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="80vh" bg={modalBgColor}>
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="baseline">
            <Flex alignItems="baseline">
              <Text mr={2} lineHeight="normal">
                System Logs
              </Text>
              {timestamp && (
                <Text fontSize="sm" color="gray.500" lineHeight="normal">
                  (Last updated: {timestamp})
                </Text>
              )}
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex mb={4} gap={2} flexWrap="wrap">
            <Tooltip label="Log to display">
              <Select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                width={{ base: 'full', md: '200px' }}
                mr={2}
              >
                {LOG_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Tooltip>

            <Tooltip label="Number of lines to display">
              <NumberInput
                min={10}
                max={1000}
                step={10}
                value={lines}
                onChange={(valueString) => setLines(parseInt(valueString))}
                width={{ base: 'full', md: '150px' }}
                mr={2}
              >
                <NumberInputField
                  placeholder="Lines"
                  color={useColorModeValue('gray.900', 'gray.100')}
                  _placeholder={{
                    color: useColorModeValue('gray.500', 'gray.500'),
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Tooltip>

            <FormControl display="flex" alignItems="center" width="auto">
              <FormLabel htmlFor="auto-refresh" mb="0" mr={2}>
                Auto-refresh
              </FormLabel>
              <Switch
                id="auto-refresh"
                isChecked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            </FormControl>

            <Tooltip label="Refresh logs now">
              <IconButton
                icon={isLoadingLogs ? <Spinner size="sm" /> : <MdRefresh />}
                onClick={fetchLogs}
                isLoading={isLoadingLogs}
                aria-label="Refresh logs"
              />
            </Tooltip>

            <Tooltip label={copied ? 'Copied!' : 'Copy logs'}>
              <IconButton
                icon={<MdContentCopy />}
                onClick={handleCopyLogs}
                aria-label="Copy logs"
                ml="auto"
              />
            </Tooltip>
          </Flex>

          <Box
            position="relative"
            height="400px"
            overflowY="auto"
            bg={codeBackground}
            borderRadius="md"
            p={4}
            fontFamily="mono"
            ref={logContainerRef}
          >
            {loading && (
              <Flex position="absolute" top={0} right={2} p={2} zIndex={1}>
                <Spinner size="sm" />
              </Flex>
            )}

            {error && (
              <Text color="red.500">Error loading logs: {error.message}</Text>
            )}

            <Code
              w="100%"
              bg="transparent"
              whiteSpace="pre-wrap"
              fontSize="sm"
              display="block"
            >
              {logContent || 'No logs to display'}
            </Code>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NavbarLogsModal;
