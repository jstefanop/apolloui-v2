import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Flex, Icon, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CustomAlert from './CustomAlert';
import config from '../../config';

const SoloMiningStatus = ({
  serviceStatus,
  ckPoolLastUpdate,
  ckDisconnected,
  blocksCount,
  blockHeader,
}) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const miner = serviceStatus?.miner;

  useEffect(() => {
    if (miner?.status === 'online' && miner?.requestedStatus === 'online') {
      const timeSinceRequest = moment().diff(
        moment(miner.requestedAt),
        'seconds'
      );

      if (timeSinceRequest <= config.thresholds.MINER_SUCCESS_THRESHOLD) {
        // Show success alert only if within 2 minutes of the request
        setShowSuccessAlert(true);
        const timer = setTimeout(() => setShowSuccessAlert(false), 5000); // Hide the alert after 5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [miner?.status, miner?.requestedStatus, miner?.requestedAt]);

  if (!miner) {
    return (
      <CustomAlert
        title="Miner status unavailable"
        description="Could not fetch the miner status. Please try again later."
        status="error"
      />
    );
  }

  const { status, requestedStatus, requestedAt } = miner;
  const timeSinceRequest = (new Date() - new Date(requestedAt)) / 1000; // Time in seconds

  // Handle pending status
  if (status === 'pending') {
    if (requestedStatus === 'offline') {
      if (timeSinceRequest <= config.thresholds.MINER_STOP_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title="Stopping miner"
            description="The miner is stopping. Please wait a moment."
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title="Stop taking longer than expected"
            description="The miner is taking longer than expected to stop. Please wait a little more or check the connection."
            status="warning"
            extraStatus={status}
          />
        );
      }
    }

    if (requestedStatus === 'online') {
      if (timeSinceRequest <= config.thresholds.MINER_START_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title="Starting miner"
            description="The miner is starting. Please wait a moment."
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title="Start taking longer than expected"
            description="The miner is taking longer than expected to start. Please wait a little more or check the connection."
            status="warning"
            extraStatus={status}
          />
        );
      }
    }
  }

  // Show info alert when the miner is offline and not requested to be online.
  if (status === 'offline' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title="Miner is offline"
        description="The miner is currently offline. You can start it from the top menu if needed."
        status="info"
      />
    );
  }

  // Show error alert when the miner is offline but requested to be online.
  if (status === 'offline' && requestedStatus === 'online') {
    return (
      <CustomAlert
        title="Miner connection issue"
        description="The miner is currently offline, but it should be online. Please check the connection or try restarting."
        status="error"
      />
    );
  }

  // Show warning alert when the miner is online but requested to be offline.
  if (status === 'online' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title="Unexpected miner status"
        description="The miner is online, but it was requested to stop. Please verify its state or restart."
        status="warning"
      />
    );
  }

  // Handle additional statuses for solo mining
  if (status === 'online') {
    if (!ckPoolLastUpdate) {
      return (
        <CustomAlert
          title="Waiting for first share"
          description="Please wait until the first share is received."
          status="info"
        />
      );
    }

    if (ckDisconnected) {
      return (
        <CustomAlert
          title="CK Pool Disconnected"
          description="Please check your node connection and the CK Pool status."
          status="warning"
        />
      );
    }

    if (blocksCount !== blockHeader) {
      return (
        <CustomAlert
          title="Node not synced"
          description="Node needs to be synced to correctly mine on SOLO mode. Please check your node for problems."
          status="warning"
        />
      );
    }
  }

  // Show success alert temporarily when the miner is online and operational.
  return (
    <>
      {showSuccessAlert && (
        <Card mb="5" borderRadius={'10px'} bg={'green.400'} p="4">
          <Flex justifyContent={'space-between'} flexDirection={'row'}>
            <Flex align={'center'} color="white">
              <Icon as={CheckIcon} mr="2" />
              <Text>
                Your miner is <strong>online</strong> and operational.{' '}
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default SoloMiningStatus;
