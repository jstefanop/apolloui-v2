import { Badge, Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import moment from 'moment';
import Card from '../card/Card';

/**
 * What the engine did, and why.
 *
 * The evidence matters as much as the verdict: every entry carries the signal
 * values that produced it. A blocked action is shown as blocked, not hidden —
 * "the rule is being throttled to protect the hardware" and "the rule is broken"
 * must not look the same.
 */
const EventsTimeline = ({ events }) => {
  const intl = useIntl();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const rowBg = useColorModeValue('secondaryGray.50', 'whiteAlpha.100');

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

        <Flex direction="column" gap="8px" maxH="420px" overflowY="auto">
          {(events || []).map((event) => {
            const badge = badgeFor(event);
            const readable = (event.signals || []).filter((s) => !s.stale);

            return (
              <Flex key={event.id} bg={rowBg} borderRadius="10px" p="12px 14px" direction="column" gap="4px">
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
      </Flex>
    </Card>
  );
};

export default EventsTimeline;
