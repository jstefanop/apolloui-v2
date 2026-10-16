import React, { useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  useToast,
  useColorModeValue,
  Box,
  Flex,
  Text,
  IconButton,
} from '@chakra-ui/react';
import {
  MdCheckCircle,
  MdErrorOutline,
  MdWarningAmber,
  MdInfoOutline,
  MdClose,
} from 'react-icons/md';

const KINDS = {
  success: { Icon: MdCheckCircle, color: 'green.400', duration: 5000 },
  error: { Icon: MdErrorOutline, color: 'red.400', duration: 8000 },
  warning: { Icon: MdWarningAmber, color: 'orange.400', duration: 8000 },
  info: { Icon: MdInfoOutline, color: 'blue.400', duration: 5000 },
};

// The one consumer of state.feedback. Every sendFeedback in the app lands here
// and becomes a toast; mounted once in _app, so it also covers sign-in and setup.
//
// It listens to the store directly rather than through useSelector: the slice
// keeps a single message, and a handler that dispatches several in a row (the
// settings save sends the restart notice, then pool and timezone outcomes) would
// have React render only the last one. A store subscription sees each dispatch.
//
// Only dispatches made after mount are shown (seq is read at mount), so state
// that is already there when the component appears never toasts.
const GlobalFeedback = () => {
  const store = useStore();
  const intl = useIntl();
  // The subscription below outlives renders; it reads the language through this.
  const intlRef = useRef(intl);
  intlRef.current = intl;
  const toast = useToast();
  const lastSeq = useRef(store.getState().feedback?.seq ?? 0);

  // Same look as StatusTransitionFeedback.
  const bg = useColorModeValue('gray.400', 'brand.300');
  const borderColor = useColorModeValue('gray.300', 'brand.200');
  const textColor = useColorModeValue('gray.900', 'white');

  // Latest values for the long-lived subscription below.
  const style = useRef({});
  style.current = { bg, borderColor, textColor };

  useEffect(() => {
    const show = ({ message, messageId, type }) => {
      const kind = KINDS[type] || KINDS.info;
      const text = messageId
        ? intlRef.current.formatMessage({ id: messageId, defaultMessage: String(message ?? '') })
        : typeof message === 'string'
          ? message
          : String(message);
      // Identical messages fired in a burst (or while still on screen) are one
      // toast; once dismissed or expired, the same message may toast again.
      const id = `feedback:${type}:${messageId || text}`;
      if (toast.isActive(id)) return;
      const { Icon } = kind;
      toast({
        id,
        position: 'top-center',
        duration: kind.duration,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            role="alert"
            bg={style.current.bg}
            borderColor={style.current.borderColor}
            borderWidth="1px"
            borderRadius="md"
            p={3}
            color={style.current.textColor}
            boxShadow="lg"
          >
            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Box as={Icon} boxSize="24px" color={kind.color} flexShrink={0} />
                <Text ml={3} fontSize="sm" fontWeight="bold" wordBreak="break-word">
                  {text}
                </Text>
              </Flex>
              <IconButton
                aria-label="Close"
                icon={<MdClose />}
                variant="ghost"
                size="sm"
                color={style.current.textColor}
                onClick={onClose}
                _hover={{ bg: 'transparent', opacity: 0.8 }}
              />
            </Flex>
          </Box>
        ),
      });
    };

    return store.subscribe(() => {
      const fb = store.getState().feedback;
      if (!fb || fb.seq === lastSeq.current) return;
      lastSeq.current = fb.seq;
      if (fb.message || fb.messageId) show(fb);
    });
  }, [store, toast]);

  return null;
};

export default GlobalFeedback;
