import React, { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { MdOfflineBolt, MdPending, MdCheckCircle } from 'react-icons/md';

const MinerStatusTransitionFeedback = ({ serviceStatus }) => {
  const [lastStatus, setLastStatus] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!serviceStatus || !serviceStatus.miner) return;

    const { status, requestedStatus } = serviceStatus.miner;

    // Initialize lastStatus if not already set
    if (!lastStatus) {
      return setLastStatus(status);
    }

    // Prevent duplicate notifications by checking if the toast was already shown for this status
    if (status === lastStatus) return;

    const iconMapping = {
      pending: MdPending,
      online: MdCheckCircle,
      offline: MdOfflineBolt,
    };

    const toastPosition = 'top'; // Position toast at the top center

    // Handle transitions between states
    if (status === 'pending') {
      if (requestedStatus === 'offline') {
        toast({
          title: 'Stopping miner',
          description: 'The miner is stopping. Please wait a moment.',
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdPending size={24} color="white" />,
        });
      } else if (requestedStatus === 'online') {
        toast({
          title: 'Starting miner',
          description: 'The miner is starting. Please wait a moment.',
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
          title: 'Miner is online',
          description: 'The miner is online and operational.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: toastPosition,
          icon: <MdCheckCircle size={24} color="green" />,
        });
      } else if (status === 'offline') {
        toast({
          title: 'Miner is offline',
          description: 'The miner has successfully stopped.',
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
  }, [serviceStatus, toast, lastStatus]);

  return null; // This component does not render anything
};

export default MinerStatusTransitionFeedback;
