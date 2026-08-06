import React, { useRef } from 'react';
import {
  Flex,
  Box,
  Text,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import Card from '../../card/Card';
import { useSettings } from '../context/SettingsContext';
import { useFormatTask } from '../../../contexts/FormatTaskContext';
import useNodeStorage from '../../../hooks/useNodeStorage';
import { DownloadIcon } from '../../UI/Icons/DownloadIcon';
import { RestoreIcon } from '../../UI/Icons/RestoreIcon';
import { FormatIcon } from '../../UI/Icons/FormatIcon';

const ExtraSettingsActions = () => {
  const intl = useIntl();
  const {
    handleBackup,
    setIsModalRestoreOpen,
  } = useSettings();
  const { openModal: openFormatModal } = useFormatTask();
  // With no disk detected there is nothing to format: the button would open a
  // dialog whose only outcome is a failure nobody can act on.
  const { state: storageState } = useNodeStorage();
  const noDrive = storageState === 'no-drive';

  const textColor = useColorModeValue('brands.900', 'white');

  // Define settings actions
  const extraSettingsActions = [
    {
      id: 'backup',
      color: 'teal',
      icon: DownloadIcon,
      title: intl.formatMessage({ id: 'settings.sections.extra.backup.title' }),
      buttonTitle: intl.formatMessage({ id: 'settings.sections.extra.backup.button' }),
      description: intl.formatMessage({ id: 'settings.sections.extra.backup.description' }),
    },
    {
      id: 'restore',
      color: 'orange',
      icon: RestoreIcon,
      title: intl.formatMessage({ id: 'settings.sections.extra.restore.title' }),
      buttonTitle: intl.formatMessage({ id: 'settings.sections.extra.restore.button' }),
      description: intl.formatMessage({ id: 'settings.sections.extra.restore.description' }),
    },
    {
      id: 'format',
      color: 'purple',
      icon: FormatIcon,
      title: intl.formatMessage({ id: 'settings.sections.extra.format.title' }),
      buttonTitle: intl.formatMessage({ id: 'settings.sections.extra.format.button' }),
      description: intl.formatMessage({ id: 'settings.sections.extra.format.description' }),
    },
  ];

  // Handle button clicks
  const handleButtonExtraSettings = (e) => {
    const actionId = e.target.id;

    if (actionId === 'backup') {
      handleBackup();
    } else if (actionId === 'restore') {
      setIsModalRestoreOpen(true);
    } else if (actionId === 'format') {
      openFormatModal();
    }
  };

  return (
    <>
      {extraSettingsActions.map((action, index) => (
        <Card
          boxShadow="unset"
          px="24px"
          py="21px"
          transition="0.2s linear"
          key={index}
        >
          <Flex justify={'space-between'}>
            <Box>
              <Flex>
                <Icon
                  w="20px"
                  h="20px"
                  as={action.icon}
                  mr="8px"
                  mt="4px"
                />
                <Text
                  fontSize="xl"
                  fontWeight="600"
                  color={textColor}
                >
                  {action.title}
                </Text>
              </Flex>
              <Text
                fontSize={{ base: 'sm', lg: 'md' }}
                fontWeight="400"
                color={'secondaryGray.800'}
              >
                {action.description}
              </Text>
            </Box>
            <Button
              variant={'solid'}
              colorScheme={action.color}
              w="200px"
              id={action.id}
              isDisabled={action.id === 'format' && noDrive}
              onClick={handleButtonExtraSettings}
            >
              {action.buttonTitle}
            </Button>
          </Flex>
        </Card>
      ))}
    </>
  );
};

export default ExtraSettingsActions;