import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useToast, useColorModeValue, Box, Flex, Text, IconButton } from '@chakra-ui/react';
import { MdOfflineBolt, MdPending, MdCheckCircle, MdClose } from 'react-icons/md';
import { useIntl } from 'react-intl';

const StatusTransitionFeedback = ({ serviceStatus, type }) => {
  const intl = useIntl();
  const [lastStatus, setLastStatus] = useState(null);
  const toast = useToast();
  const lastLocale = useRef(intl.locale);
  const activeToastIds = useRef(new Set());
  const toastRef = useRef(null);

  // Get brand colors based on color mode
  const toastBg = useColorModeValue('gray.400', 'brand.300');
  const toastBorderColor = useColorModeValue('gray.300', 'brand.200');
  const toastTitleColor = useColorModeValue('gray.900', 'white');
  const toastTextColor = useColorModeValue('gray.600', 'gray.500');

  // Function to close all active toasts - wrapped in useCallback to prevent recreation on each render
  const closeAllToasts = useCallback(() => {
    activeToastIds.current.forEach((id) => {
      toast.close(id);
    });
    activeToastIds.current.clear();
  }, [toast]);

  // Effect to handle language changes
  useEffect(() => {
    if (lastLocale.current !== intl.locale) {
      // Close all existing toasts
      closeAllToasts();

      // Reset state
      setLastStatus(null);
      lastLocale.current = intl.locale;

      // Force a re-render of any existing toasts
      if (toastRef.current) {
        const currentToast = toastRef.current;
        toast.close(currentToast);
        toastRef.current = null;
      }
    }
  }, [intl.locale, toast, closeAllToasts]);

  // Custom toast renderer
  const renderToast = useCallback(({ title, description, icon, onClose }) => (
    <Box
      bg={toastBg}
      borderColor={toastBorderColor}
      borderWidth="1px"
      borderRadius="md"
      p={3}
      color={toastTextColor}
      boxShadow="lg"
    >
      <Flex align="center" justify="space-between">
        <Flex align="center">
          {icon}
          <Box ml={3}>
            <Text fontWeight="bold" color={toastTitleColor}>{title}</Text>
            <Text fontSize="sm">{description}</Text>
          </Box>
        </Flex>
        <IconButton
          icon={<MdClose />}
          variant="ghost"
          size="sm"
          color={toastTextColor}
          onClick={onClose}
          _hover={{ bg: 'transparent', opacity: 0.8 }}
        />
      </Flex>
    </Box>
  ), [toastBg, toastBorderColor, toastTextColor, toastTitleColor]);

  // Development mode test toasts
  useEffect(() => {
    if (process.env.NODE_ENV === 'developmentTEST') {
      const entity = type === 'miner' ? 'miner' : 'node';
      const toastPosition = 'top-center';

      // Show all possible toast states
      const testToasts = [
        {
          id: `test-stopping-${entity}`,
          title: intl.formatMessage({
            id: `status_transition.${entity}.stopping.title`,
          }),
          description: intl.formatMessage({
            id: `status_transition.${entity}.stopping.description`,
          }),
          icon: <MdPending size={24} color="teal" />,
        },
        {
          id: `test-starting-${entity}`,
          title: intl.formatMessage({
            id: `status_transition.${entity}.starting.title`,
          }),
          description: intl.formatMessage({
            id: `status_transition.${entity}.starting.description`,
          }),
          icon: <MdPending size={24} color="blue" />,
        },
        {
          id: `test-online-${entity}`,
          title: intl.formatMessage({
            id: `status_transition.${entity}.online.title`,
          }),
          description: intl.formatMessage({
            id: `status_transition.${entity}.online.description`,
          }),
          icon: <MdCheckCircle size={24} color="green" />,
        },
        {
          id: `test-offline-${entity}`,
          title: intl.formatMessage({
            id: `status_transition.${entity}.offline.title`,
          }),
          description: intl.formatMessage({
            id: `status_transition.${entity}.offline.description`,
          }),
          icon: <MdOfflineBolt size={24} color="orange" />,
        },
      ];

      // Show each toast with a delay
      testToasts.forEach((toastConfig, index) => {
        setTimeout(() => {
          toastRef.current = toast({
            ...toastConfig,
            duration: 5000,
            isClosable: true,
            position: toastPosition,
            render: (props) => renderToast({ ...toastConfig, ...props }),
          });
          activeToastIds.current.add(toastConfig.id);
        }, index * 2000); // Show each toast 2 seconds after the previous one
      });

      // Cleanup function
      return () => {
        closeAllToasts();
      };
    }
  }, [intl, toast, type, closeAllToasts, toastBg, toastBorderColor, toastTextColor, renderToast]);

  useEffect(() => {
    if (!serviceStatus || !serviceStatus[type]) return;

    const { status, requestedStatus } = serviceStatus[type];

    // Initialize lastStatus if not already set
    if (!lastStatus) {
      return setLastStatus(status);
    }

    // Prevent duplicate notifications by checking if the toast was already shown for this status
    if (status === lastStatus) {
      return;
    }

    const toastPosition = 'top-center';

    // Define dynamic labels based on type
    const entity = type === 'miner' ? 'miner' : type === 'solo' ? 'solo' : 'node';

    // Handle transitions between states
    if (status === 'pending') {
      if (requestedStatus === 'offline') {
        const id = `stopping-${entity}-${Date.now()}`;
        const title = intl.formatMessage({
          id: `status_transition.${entity}.stopping.title`,
        });
        const description = intl.formatMessage({
          id: `status_transition.${entity}.stopping.description`,
        });

        toastRef.current = toast({
          id,
          title,
          description,
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="teal" />,
          render: (props) => renderToast({ title, description, icon: <MdPending size={24} color="teal" />, ...props }),
        });
        activeToastIds.current.add(id);
      } else if (requestedStatus === 'online') {
        const id = `starting-${entity}-${Date.now()}`;
        const title = intl.formatMessage({
          id: `status_transition.${entity}.starting.title`,
        });
        const description = intl.formatMessage({
          id: `status_transition.${entity}.starting.description`,
        });

        toastRef.current = toast({
          id,
          title,
          description,
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="blue" />,
          render: (props) => renderToast({ title, description, icon: <MdPending size={24} color="blue" />, ...props }),
        });
        activeToastIds.current.add(id);
      }
    } else if (status === requestedStatus) {
      // Notify when the requested status matches the current status
      if (status === 'online') {
        const id = `online-${entity}-${Date.now()}`;
        const title = intl.formatMessage({
          id: `status_transition.${entity}.online.title`,
        });
        const description = intl.formatMessage({
          id: `status_transition.${entity}.online.description`,
        });

        toastRef.current = toast({
          id,
          title,
          description,
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdCheckCircle size={24} color="green" />,
          render: (props) => renderToast({ title, description, icon: <MdCheckCircle size={24} color="green" />, ...props }),
        });
        activeToastIds.current.add(id);
      } else if (status === 'offline') {
        const id = `offline-${entity}-${Date.now()}`;
        const title = intl.formatMessage({
          id: `status_transition.${entity}.offline.title`,
        });
        const description = intl.formatMessage({
          id: `status_transition.${entity}.offline.description`,
        });

        toastRef.current = toast({
          id,
          title,
          description,
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdOfflineBolt size={24} color="orange" />,
          render: (props) => renderToast({ title, description, icon: <MdOfflineBolt size={24} color="orange" />, ...props }),
        });
        activeToastIds.current.add(id);
      }
    }

    // Update the last status to prevent duplicate notifications
    setLastStatus(status);
  }, [serviceStatus, type, toast, lastStatus, intl, toastBg, toastBorderColor, toastTextColor, renderToast]);

  return null; // This component does not render anything
};

export default StatusTransitionFeedback;
