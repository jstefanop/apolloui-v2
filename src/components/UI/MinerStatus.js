import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Flex, Icon, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CustomAlert from './CustomAlert';
import config from '../../config';
import { useIntl, FormattedMessage } from 'react-intl';

const MinerStatus = ({ serviceStatus }) => {
  const intl = useIntl();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const miner = serviceStatus?.miner;

  // Show success alert only when the component is first loaded, if the miner is online and requested status is also online within 2 minutes of the request.
  useEffect(() => {
    let timer;
    if (miner?.status === 'online' && miner?.requestedStatus === 'online') {
      const timeSinceRequest = moment().diff(
        moment(miner.requestedAt),
        'seconds'
      );

      if (timeSinceRequest <= config.thresholds.MINER_SUCCESS_THRESHOLD) {
        // Show success alert only if within 2 minutes of the request
        setShowSuccessAlert(true);
        timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [miner?.status, miner?.requestedStatus, miner?.requestedAt]);

  if (!miner) {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'miner.status.unavailable.title' })}
        description={intl.formatMessage({ id: 'miner.status.unavailable.description' })}
        status="error"
      />
    );
  }

  const { status, requestedStatus, requestedAt } = miner;
  const timeSinceRequest = moment().diff(moment(requestedAt), 'seconds');

  // Handle pending status
  if (status === 'pending') {
    if (requestedStatus === 'offline') {
      if (timeSinceRequest <= config.thresholds.MINER_STOP_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'miner.status.stopping.title' })}
            description={intl.formatMessage({ id: 'miner.status.stopping.description' })}
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'miner.status.stop_delay.title' })}
            description={intl.formatMessage({ id: 'miner.status.stop_delay.description' })}
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
            title={intl.formatMessage({ id: 'miner.status.starting.title' })}
            description={intl.formatMessage({ id: 'miner.status.starting.description' })}
            status="info"
            extraStatus={status}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'miner.status.start_delay.title' })}
            description={intl.formatMessage({ id: 'miner.status.start_delay.description' })}
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
        title={intl.formatMessage({ id: 'miner.status.offline.title' })}
        description={intl.formatMessage({ id: 'miner.status.offline.description' })}
        status="info"
      />
    );
  }

  // Show error alert when the miner is offline but requested to be online.
  if (status === 'offline' && requestedStatus === 'online') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'miner.status.connection_issue.title' })}
        description={intl.formatMessage({ id: 'miner.status.connection_issue.description' })}
        status="error"
      />
    );
  }

  // Show warning alert when the miner is online but requested to be offline.
  if (status === 'online' && requestedStatus === 'offline') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'miner.status.unexpected.title' })}
        description={intl.formatMessage({ id: 'miner.status.unexpected.description' })}
        status="warning"
      />
    );
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
                <FormattedMessage 
                  id="miner.status.online.message"
                  values={{ online: <strong>online</strong> }}
                />
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default MinerStatus;
