import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Flex, Icon, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CustomAlert from './CustomAlert';
import config from '../../config';

const NodeStatus = ({ serviceStatus }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const node = serviceStatus?.node;

  // Show success alert only when the component is first loaded, if the node is online and requested status is also online within 2 minutes of the request.
  useEffect(() => {
    if (node?.status === 'online' && node?.requestedStatus === 'online') {
      const timeSinceRequest = moment().diff(
        moment(node.requestedAt),
        'seconds'
      );

      if (timeSinceRequest <= config.thresholds.NODE_SUCCESS_THRESHOLD) {
        setShowSuccessAlert(true);
        const timer = setTimeout(() => setShowSuccessAlert(false), 5000); // Hide the alert after 5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [node?.status, node?.requestedStatus, node?.requestedAt]);

  if (!node) {
    return (
      <CustomAlert
        title="Node status unavailable"
        description="Could not fetch the node status. Please try again later."
        status="error"
      />
    );
  }

  const { status, requestedStatus, requestedAt } = node;
  const timeSinceRequest = moment().diff(moment(requestedAt), 'seconds');

  // Handle pending status
  if (status === 'pending') {
    if (requestedStatus === 'offline') {
      if (timeSinceRequest <= config.thresholds.NODE_STOP_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title="Stopping node"
            description="The node is stopping. Please wait a moment."
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title="Stop taking longer than expected"
            description="The node is taking longer than expected to stop. Please wait a little more or check the connection."
            status="warning"
            extraStatus={status}
          />
        );
      }
    }

    if (requestedStatus === 'online') {
      if (timeSinceRequest <= config.thresholds.NODE_START_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title="Starting node"
            description="The node is starting. Please wait a moment."
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title="Start taking longer than expected"
            description="The node is taking longer than expected to start. Please wait a little more or check the connection."
            status="warning"
            extraStatus={status}
          />
        );
      }
    }
  }

  // Show info alert when the node is offline and not requested to be online.
  if (status === 'offline' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title="Node is offline"
        description="The node is currently offline. You can start it from the top menu if needed."
        status="info"
      />
    );
  }

  // Show error alert when the node is offline but requested to be online.
  if (status === 'offline' && requestedStatus === 'online') {
    return (
      <CustomAlert
        title="Node connection issue"
        description="The node is currently offline, but it should be online. Please check the connection or try restarting."
        status="error"
      />
    );
  }

  // Show warning alert when the node is online but requested to be offline.
  if (status === 'online' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title="Unexpected node status"
        description="The node is online, but it was requested to stop. Please verify its state or restart."
        status="warning"
      />
    );
  }

  // Show success alert temporarily when the node is online and operational.
  return (
    <>
      {showSuccessAlert && (
        <Card mb="5" borderRadius={'10px'} bg={'green.400'} p="4">
          <Flex justifyContent={'space-between'} flexDirection={'row'}>
            <Flex align={'center'} color="white">
              <Icon as={CheckIcon} mr="2" />
              <Text>
                Your node is <strong>online</strong> and operational.{' '}
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default NodeStatus;
