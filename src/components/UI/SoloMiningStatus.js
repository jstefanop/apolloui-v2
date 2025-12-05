import React, { useState, useEffect } from 'react';
import moment from '../../lib/moment';
import { Card, Flex, Icon, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import CustomAlert from './CustomAlert';
import config from '../../config';
import { useIntl, FormattedMessage } from 'react-intl';

const SoloMiningStatus = ({
  serviceStatus,
  ckPoolLastUpdate,
  ckDisconnected,
  blocksCount,
  blockHeader,
  onStart,
}) => {
  const intl = useIntl();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  // Get solo service status only
  const soloService = serviceStatus?.solo;

  useEffect(() => {
    let timer;
    
    // Check for solo service success
    if (soloService?.status === 'online' && soloService?.requestedStatus === 'online') {
      const timeSinceRequest = moment().diff(
        moment(soloService.requestedAt),
        'seconds'
      );

      if (timeSinceRequest <= config.thresholds.MINER_SUCCESS_THRESHOLD) {
        setShowSuccessAlert(true);
        timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [soloService?.status, soloService?.requestedStatus, soloService?.requestedAt]);

  // Check if solo service is available
  if (!soloService) {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.solo_unavailable.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.solo_unavailable.description' })}
        status="error"
      />
    );
  }

  // Handle solo service status
  const { status: soloStatus, requestedStatus: soloRequestedStatus, requestedAt: soloRequestedAt } = soloService;
  const soloTimeSinceRequest = soloRequestedAt ? (new Date() - new Date(soloRequestedAt)) / 1000 : 0;

  // Handle error status - solo service crashed or has an error
  // This can happen with requestedStatus null (no request made) or any other value
  if (soloStatus === 'error') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.error.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.error.description' })}
        status="error"
      />
    );
  }

  // Handle unknown status - solo service status is unknown
  if (soloStatus === 'unknown') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.solo_unknown.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.solo_unknown.description' })}
        status="warning"
      />
    );
  }

  // Handle solo service pending status
  if (soloStatus === 'pending') {
    if (soloRequestedStatus === 'offline') {
      if (soloTimeSinceRequest <= config.thresholds.MINER_STOP_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'solo_mining.status.solo_stopping.title' })}
            description={intl.formatMessage({ id: 'solo_mining.status.solo_stopping.description' })}
            status="info"
            extraStatus={soloStatus}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'solo_mining.status.solo_stop_delay.title' })}
            description={intl.formatMessage({ id: 'solo_mining.status.solo_stop_delay.description' })}
            status="warning"
            extraStatus={soloStatus}
          />
        );
      }
    }

    if (soloRequestedStatus === 'online') {
      if (soloTimeSinceRequest <= config.thresholds.MINER_START_PENDING_THRESHOLD) {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'solo_mining.status.solo_starting.title' })}
            description={intl.formatMessage({ id: 'solo_mining.status.solo_starting.description' })}
            status="info"
            extraStatus={soloStatus}
          />
        );
      } else {
        return (
          <CustomAlert
            title={intl.formatMessage({ id: 'solo_mining.status.solo_start_delay.title' })}
            description={intl.formatMessage({ id: 'solo_mining.status.solo_start_delay.description' })}
            status="warning"
            extraStatus={soloStatus}
          />
        );
      }
    }
  }

  // Show info alert when the solo service is offline and not requested to be online
  // Handle both requestedStatus === 'offline' and requestedStatus === null
  if (soloStatus === 'offline' && (soloRequestedStatus === 'offline' || soloRequestedStatus === null)) {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.solo_offline.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.solo_offline.description' })}
        status="info"
      />
    );
  }

  // Show error alert when the solo service is offline but requested to be online
  if (soloStatus === 'offline' && soloRequestedStatus === 'online') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.solo_connection_issue.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.solo_connection_issue.description' })}
        status="error"
      />
    );
  }

  // Show warning alert when the solo service is online but requested to be offline
  if (soloStatus === 'online' && soloRequestedStatus === 'offline') {
    return (
      <CustomAlert
        title={intl.formatMessage({ id: 'solo_mining.status.solo_unexpected.title' })}
        description={intl.formatMessage({ id: 'solo_mining.status.solo_unexpected.description' })}
        status="warning"
      />
    );
  }

  // If solo service is online, check additional solo-specific statuses
  if (soloStatus === 'online') {
    if (!ckPoolLastUpdate) {
      return (
        <CustomAlert
          title={intl.formatMessage({ id: 'solo_mining.status.waiting_share.title' })}
          description={intl.formatMessage({ id: 'solo_mining.status.waiting_share.description' })}
          status="info"
        />
      );
    }

    if (ckDisconnected) {
      return (
        <CustomAlert
          title={intl.formatMessage({ id: 'solo_mining.status.ck_pool_disconnected.title' })}
          description={intl.formatMessage({ id: 'solo_mining.status.ck_pool_disconnected.description' })}
          status="warning"
        />
      );
    }

    if (blocksCount !== blockHeader) {
      return (
        <CustomAlert
          title={intl.formatMessage({ id: 'solo_mining.status.node_not_synced.title' })}
          description={intl.formatMessage({ id: 'solo_mining.status.node_not_synced.description' })}
          status="warning"
          variant="horizontal"
        />
      );
    }
  }

  // Show success alert temporarily when the solo service is online and operational
  return (
    <>
      {showSuccessAlert && (
        <Card mb="5" borderRadius={'10px'} bg={'green.400'} p="4">
          <Flex justifyContent={'space-between'} flexDirection={'row'}>
            <Flex align={'center'} color="white">
              <Icon as={CheckIcon} mr="2" />
              <Text>
                <FormattedMessage 
                  id="solo_mining.status.online.message"
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

export default SoloMiningStatus;

