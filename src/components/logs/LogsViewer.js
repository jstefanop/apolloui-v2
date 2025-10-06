import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
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
  Flex,
  Text,
} from '@chakra-ui/react';
import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { LOGS_READ_QUERY } from '../../graphql/logs';
import { updateLogs } from '../../redux/slices/logsSlice';
import { MdRefresh, MdContentCopy } from 'react-icons/md';
import moment from 'moment';

export const LOG_TYPES = [
  { value: 'CKPOOL', label: 'CK Pool' },
  { value: 'MINER', label: 'Bitcoin Miner' },
  { value: 'NODE', label: 'Bitcoin Node' },
];

// Filter log types based on device type
const getAvailableLogTypes = () => {
  const deviceType = process.env.NEXT_PUBLIC_DEVICE_TYPE;
  
  if (deviceType === 'solo-node') {
    // Hide miner logs for solo-node devices
    return LOG_TYPES.filter(type => type.value !== 'MINER');
  }
  
  return LOG_TYPES;
};

const LogsViewer = ({ 
  initialLogType = 'CKPOOL',
  initialLines = 20,
  initialAutoRefresh = true,
  refreshInterval = 5000,
  showHeader = true,
  height = '400px'
}) => {
  const availableLogTypes = getAvailableLogTypes();
  const deviceType = process.env.NEXT_PUBLIC_DEVICE_TYPE;
  
  // Ensure initial log type is available for the current device type
  const getValidInitialLogType = () => {
    if (deviceType === 'solo-node' && initialLogType === 'MINER') {
      return 'CKPOOL'; // Default to CKPOOL if MINER is not available
    }
    return initialLogType;
  };
  
  const [logType, setLogType] = useState(getValidInitialLogType());
  const [lines, setLines] = useState(initialLines);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef(null);
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.logs);
  const codeBackground = useColorModeValue('gray.200', 'gray.700');
  const inputTextColor = useColorModeValue('gray.900', 'gray.100');
  const placeholderColor = useColorModeValue('gray.500', 'gray.500');

  const [getLogs, { loading: queryLoading, error: queryError, data: queryData }] = useLazyQuery(LOGS_READ_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
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

  const fetchLogs = useCallback(() => {
    setIsLoadingLogs(true);
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
  }, [logType, lines, getLogs]);

  useEffect(() => {
    fetchLogs();
    let intervalRef = null;

    if (autoRefresh) {
      intervalRef = setInterval(fetchLogs, refreshInterval);
    }

    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [logType, lines, autoRefresh, fetchLogs, refreshInterval]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data]);

  const handleCopyLogs = () => {
    const content = queryData?.Logs?.read?.result?.content;
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const logContent = queryData?.Logs?.read?.result?.content || '';
  const timestamp = queryData?.Logs?.read?.result?.timestamp
    ? moment(queryData.Logs.read.result.timestamp).format('YYYY-MM-DD HH:mm:ss')
    : '';

  return (
    <Box>
      {showHeader && (
        <Flex mb={4} gap={2} flexWrap="wrap">
          <Tooltip label="Log to display">
            <Select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              width={{ base: 'full', md: '200px' }}
              mr={2}
            >
              {availableLogTypes.map((type) => (
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
                color={inputTextColor}
                _placeholder={{
                  color: placeholderColor,
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
      )}

      <Box
        position="relative"
        height={height}
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

      {showHeader && timestamp && (
        <Text fontSize="sm" color="gray.500" mt={2}>
          Last updated: {timestamp}
        </Text>
      )}
    </Box>
  );
};

export default LogsViewer; 