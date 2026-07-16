import { useState } from 'react';
import { Badge, Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import moment from 'moment';
import Card from '../card/Card';
import EventDetailModal from './EventDetailModal';

/**
 * What the engine did, and why.
 *
 * The evidence matters as much as the verdict: every entry carries the signal
 * values that produced it. A blocked action is shown as blocked, not hidden —
 * "the rule is being throttled to protect the hardware" and "the rule is broken"
 * must not look the same.
 */
const EventsTimeline = ({ events, hasMore, loadingMore, onLoadMore }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const rowHover = useColorModeValue('secondaryGray.100', 'whiteAlpha.200');
  const scrollThumb = useColorModeValue('rgba(0,0,0,0.18)', 'rgba(255,255,255,0.18)');
  const scrollThumbHover = useColorModeValue('rgba(0,0,0,0.30)', 'rgba(255,255,255,0.30)');
  const [selected, setSelected] = useState(null);

  // Discreet, thin scrollbar (matches the pattern used elsewhere in the app).
  const scrollStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${scrollThumb} transparent`,
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: scrollThumb,
      borderRadius: '6px',
      '&:hover': { background: scrollThumbHover },
    },
  };

  const badgeFor = (event) => {
    if (event.blockedBy) return { colorScheme: 'orange', label: event.blockedBy };
    if (event.applied) return { colorScheme: 'green', label: event.changeType };
    if (event.dryRun) return { colorScheme: 'blue', label: intl.formatMessage({ id: 'automation.events.dry_run' }) };
    return { colorScheme: 'gray', label: event.decision };
  };

  return (
    <Card p="20px">
      <Flex direction="column" gap="12px">
        <Flex direction="column">
          <Text color={textColor} fontSize="lg" fontWeight="700">
            {intl.formatMessage({ id: 'automation.events.title' })}
          </Text>
          <Text color={subTextColor} fontSize="sm">
            {intl.formatMessage({ id: 'automation.events.description' })}
          </Text>
        </Flex>

        {!events?.length && (
          <Box bg={rowBg} borderRadius="10px" p="20px" textAlign="center">
            <Text fontSize="sm" color={subTextColor}>
              {intl.formatMessage({ id: 'automation.events.empty' })}
            </Text>
          </Box>
        )}

        <Flex direction="column" gap="8px" maxH="420px" overflowY="auto" pr="4px" sx={scrollStyle}>
          {(events || []).map((event) => {
            const badge = badgeFor(event);
            const readable = (event.signals || []).filter((s) => !s.stale);

            return (
              <Flex
                key={event.id}
                as="button"
                textAlign="left"
                bg={rowBg}
                _hover={{ bg: rowHover }}
                borderRadius="10px"
                p="12px 14px"
                direction="column"
                gap="4px"
                onClick={() => setSelected(event)}
              >
                <Flex align="center" gap="8px" wrap="wrap">
                  <Text fontSize="xs" color={subTextColor} minW="110px">
                    {moment(event.createdAt).format('DD/MM HH:mm:ss')}
                  </Text>
                  <Badge colorScheme={badge.colorScheme}>{badge.label}</Badge>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {event.decision}
                  </Text>
                  {event.ruleName && (
                    <Text fontSize="sm" color={subTextColor}>
                      {event.ruleName}
                    </Text>
                  )}
                </Flex>

                {event.message && (
                  <Text fontSize="xs" color={subTextColor}>
                    {event.message}
                  </Text>
                )}

                {readable.length > 0 && (
                  <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                    {readable.map((s) => `${s.id}=${s.value}`).join(' · ')}
                  </Text>
                )}
              </Flex>
            );
          })}
        </Flex>

        {hasMore && (
          <Button variant="light" size="sm" alignSelf="center" onClick={onLoadMore} isLoading={loadingMore}>
            {intl.formatMessage({ id: 'automation.events.load_more' })}
          </Button>
        )}
      </Flex>

      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    </Card>
  );
};

export default EventsTimeline;
