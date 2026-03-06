import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Link,
  Spinner,
  Card,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import Confetti from '../UI/Confetti';
import { NODE_RECENT_BLOCKS_QUERY } from '../../graphql/node';

const BlockCard = ({ block, isLatest }) => {
  const isFutureBit = block.extras?.pool?.name?.toLowerCase().includes('futurebit');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const cardBg = useColorModeValue(
    isFutureBit ? 'yellow.100' : isLatest ? 'gray.300' : 'white',
    isFutureBit ? 'yellow.900' : isLatest ? 'gray.700' : 'brand.200'
  );
  const borderColor = useColorModeValue(
    isFutureBit ? 'yellow.300' : isLatest ? 'gray.400' : 'gray.200',
    isFutureBit ? 'yellow.700' : isLatest ? 'brand.700' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isFutureBit ? 'yellow.800' : isLatest ? 'blue.600' : 'gray.600',
    isFutureBit ? 'yellow.200' : isLatest ? 'gray.600' : 'gray.400'
  );
  const valueColor = useColorModeValue(
    isFutureBit ? 'yellow.900' : isLatest ? 'blue.800' : 'gray.800',
    isFutureBit ? 'yellow.100' : isLatest ? 'white' : 'white'
  );

  useEffect(() => {
    if (isFutureBit) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000); // Stop confetti after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isFutureBit]);

  return (
    <Flex direction="column" align="center" mr="15px" position="relative">
      <Text 
        fontSize="lg" 
        fontWeight="bold" 
        color={textColor}
        mb="2"
        position="relative"
        zIndex="2"
      >
        #{block.height}
      </Text>
      
      <Card
        p="15px"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        minW="200px"
        _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
        position="relative"
        zIndex="2"
        overflow="hidden"
      >
        {showConfetti && (
          <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1">
            <Confetti width="200px" height="300px" duration={5} numberOfPieces={50} />
          </Box>
        )}
        <Link href={`https://mempool.space/block/${block.id}`} isExternal>
          <Flex direction="column" gap="3" align="center">
            {/* <Text fontSize="xs" color={valueColor}>
              {(block.size / 1024 / 1024).toFixed(2)} MB
            </Text> */}
            
            <Text fontSize="lg" fontWeight="bold" color={valueColor}>
              {block.extras?.reward ? block.extras.reward.toFixed(4) : '0.0000'} BTC
            </Text>
            <Text fontSize="xs" color={textColor} mt="-4">
              Reward
            </Text>
            <Text fontSize="xs" color={textColor} mt="-1">
              Fees: {block.extras?.totalFees ? block.extras.totalFees.toFixed(4) : '0.0000'} BTC
            </Text>

            {/* <Text fontSize="xs" color={valueColor}>
              {block.tx_count} txs
            </Text> */}

            <Tooltip label={moment.unix(block.timestamp).format('MMMM D, YYYY HH:mm:ss')}>
              <Text fontSize="md" color={valueColor}>
                {moment.unix(block.timestamp).fromNow()}
              </Text>
            </Tooltip>
          </Flex>
        </Link>
      </Card>

      <Text 
        fontSize="sm" 
        color={textColor}
        mt="2"
        textAlign="center"
        position="relative"
        zIndex="2"
      >
        {block.extras?.pool?.name || 'Unknown'}
      </Text>
    </Flex>
  );
};

const LatestBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const trackBg = useColorModeValue('gray.100', 'gray.700');
  const thumbBg = useColorModeValue('gray.300', 'gray.600');
  const thumbHoverBg = useColorModeValue('gray.400', 'gray.500');

  // Use GraphQL query instead of fetch
  const { loading, error, data } = useQuery(NODE_RECENT_BLOCKS_QUERY, {
    variables: { count: 15 },
    pollInterval: 60000, // Poll every 60 seconds (data updates every 5 min on server)
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Process blocks data from GraphQL response
  useEffect(() => {
    if (data?.Node?.recentBlocks?.result?.blocks) {
      let updatedBlocks = [...data.Node.recentBlocks.result.blocks];
      
      // Add fake FutureBit block only in development
      if (process.env.NODE_ENV === 'development' && updatedBlocks.length > 0) {
        const futureBitBlock = {
          id: 'futurebit-block',
          height: updatedBlocks[0].height + 1,
          size: 1000000,
          tx_count: 2000,
          timestamp: Math.floor(Date.now() / 1000),
          extras: {
            totalFees: 12300000,
            pool: {
              name: 'FutureBit-Apollo',
              slug: 'futurebit-apollo'
            }
          }
        };
        
        updatedBlocks = [
          updatedBlocks[0],
          futureBitBlock,
          ...updatedBlocks.slice(1, 9)
        ];
      } else {
        updatedBlocks = updatedBlocks.slice(0, 10);
      }
      
      setBlocks(updatedBlocks);
    }
  }, [data]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Determine error message from GraphQL response
  const errorMessage = error?.message 
    || data?.Node?.recentBlocks?.error?.message 
    || data?.Node?.recentBlocks?.result?.error;

  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (errorMessage) {
    return (
      <Alert status="warning" borderRadius="10px" mb="5">
        <AlertIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage || 'Failed to fetch blocks. Trying again in 1 minute.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box 
      ref={scrollContainerRef}
      overflowX="auto" 
      position="relative"
      zIndex="0"
      css={{
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: trackBg,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: thumbBg,
          borderRadius: '4px',
          '&:hover': {
            background: thumbHoverBg,
          },
        },
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      cursor={isDragging ? 'grabbing' : 'grab'}
      userSelect="none"
    >
      <Flex direction="row" pb="10px">
        {blocks.map((block, index) => (
          <BlockCard key={block.id} block={block} isLatest={index === 0} />
        ))}
      </Flex>
    </Box>
  );
};

export default LatestBlocks; 