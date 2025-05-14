import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { MdOfflineBolt, MdPending, MdCheckCircle } from 'react-icons/md';
import { useIntl } from 'react-intl';

const StatusTransitionFeedback = ({ serviceStatus, type }) => {
  const intl = useIntl();
  const [lastStatus, setLastStatus] = useState(null);
  const toast = useToast();
  const lastLocale = useRef(intl.locale);
  const activeToastIds = useRef(new Set());
  const toastRef = useRef(null);

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

    const toastPosition = 'top'; // Position toast at the top center

    // Define dynamic labels based on type
    const entity = type === 'miner' ? 'miner' : 'node';

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
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="white" />,
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
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="white" />,
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
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdCheckCircle size={24} color="green" />,
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
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdOfflineBolt size={24} color="red" />,
        });
        activeToastIds.current.add(id);
      }
    }

    // Update the last status to prevent duplicate notifications
    setLastStatus(status);
  }, [serviceStatus, type, toast, lastStatus, intl]);

  return null; // This component does not render anything
};

export default StatusTransitionFeedback;
