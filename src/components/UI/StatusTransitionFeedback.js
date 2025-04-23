import React, { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { MdOfflineBolt, MdPending, MdCheckCircle } from 'react-icons/md';
import { useIntl } from 'react-intl';

const StatusTransitionFeedback = ({ serviceStatus, type }) => {
  const intl = useIntl();
  const [lastStatus, setLastStatus] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!serviceStatus || !serviceStatus[type]) return;

    const { status, requestedStatus } = serviceStatus[type];

    // Initialize lastStatus if not already set
    if (!lastStatus) {
      return setLastStatus(status);
    }

    // Prevent duplicate notifications by checking if the toast was already shown for this status
    if (status === lastStatus) return;

    const toastPosition = 'top'; // Position toast at the top center

    // Define dynamic labels based on type
    const entity = type === 'miner' ? 'miner' : 'node';

    // Handle transitions between states
    if (status === 'pending') {
      if (requestedStatus === 'offline') {
        toast({
          title: intl.formatMessage({ id: `status_transition.${entity}.stopping.title` }),
          description: intl.formatMessage({ id: `status_transition.${entity}.stopping.description` }),
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="white" />,
        });
      } else if (requestedStatus === 'online') {
        toast({
          title: intl.formatMessage({ id: `status_transition.${entity}.starting.title` }),
          description: intl.formatMessage({ id: `status_transition.${entity}.starting.description` }),
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="white" />,
        });
      }
    } else if (status === requestedStatus) {
      // Notify when the requested status matches the current status
      if (status === 'online') {
        toast({
          title: intl.formatMessage({ id: `status_transition.${entity}.online.title` }),
          description: intl.formatMessage({ id: `status_transition.${entity}.online.description` }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdCheckCircle size={24} color="green" />,
        });
      } else if (status === 'offline') {
        toast({
          title: intl.formatMessage({ id: `status_transition.${entity}.offline.title` }),
          description: intl.formatMessage({ id: `status_transition.${entity}.offline.description` }),
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdOfflineBolt size={24} color="red" />,
        });
      }
    }

    // Update the last status to prevent duplicate notifications
    setLastStatus(status);
  }, [serviceStatus, type, toast, lastStatus, intl]);

  return null; // This component does not render anything
};

export default StatusTransitionFeedback;
