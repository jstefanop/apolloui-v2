import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Flex, Icon, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CustomAlert from './CustomAlert';
import config from '../../config';
import { useIntl } from 'react-intl';

const NodeStatus = ({ serviceStatus }) => {
  const intl = useIntl();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const node = serviceStatus?.node;

  // Show success alert only when the component is first loaded, if the node is online and requested status is also online within 2 minutes of the request.
  useEffect(() => {
    let timer;
    if (node?.status === 'online' && node?.requestedStatus === 'online') {
      const timeSinceRequest = moment().diff(
        moment(node.requestedAt),
        'seconds'
      );

      if (timeSinceRequest <= config.thresholds.NODE_SUCCESS_THRESHOLD) {
        setShowSuccessAlert(true);
        timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [node?.status, node?.requestedStatus, node?.requestedAt]);

  if (!node) {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'node.status.unavailable.title' })}
        description={intl.formatMessage({ id: 'node.status.unavailable.description' })}
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
            title={intl.formatMessage({ id: 'node.status.stopping.title' })}
            description={intl.formatMessage({ id: 'node.status.stopping.description' })}
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'node.status.stop_delay.title' })}
            description={intl.formatMessage({ id: 'node.status.stop_delay.description' })}
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
            title={intl.formatMessage({ id: 'node.status.starting.title' })}
            description={intl.formatMessage({ id: 'node.status.starting.description' })}
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'node.status.start_delay.title' })}
            description={intl.formatMessage({ id: 'node.status.start_delay.description' })}
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
        title={intl.formatMessage({ id: 'node.status.offline.title' })}
        description={intl.formatMessage({ id: 'node.status.offline.description' })}
        status="info"
      />
    );
  }

  // Show error alert when the node is offline but requested to be online.
  if (status === 'offline' && requestedStatus === 'online') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'node.status.connection_issue.title' })}
        description={intl.formatMessage({ id: 'node.status.connection_issue.description' })}
        status="error"
      />
    );
  }

  // Show warning alert when the node is online but requested to be offline.
  if (status === 'online' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'node.status.unexpected.title' })}
        description={intl.formatMessage({ id: 'node.status.unexpected.description' })}
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
                {intl.formatMessage({ id: 'node.status.online.message' })}
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default NodeStatus;

