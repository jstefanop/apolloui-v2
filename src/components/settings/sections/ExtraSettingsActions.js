import React, { useRef } from 'react';
import {
  Flex,
  Box,
  Text,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from '../../card/Card';
import { useSettings } from '../context/SettingsContext';
import { DownloadIcon } from '../../UI/Icons/DownloadIcon';
import { RestoreIcon } from '../../UI/Icons/RestoreIcon';
import { FormatIcon } from '../../UI/Icons/FormatIcon';

const ExtraSettingsActions = () => {
  const {
    handleBackup,
    setIsModalRestoreOpen,
    setIsModalFormatOpen
  } = useSettings();

  const textColor = useColorModeValue('brands.900', 'white');

  // Define settings actions
  const extraSettingsActions = [
    {
      id: 'backup',
      color: 'teal',
      icon: DownloadIcon,
      title: 'Backup settings',
      buttonTitle: 'BACKUP',
      description:
        'Create a backup file of dashboard, miner and pools configurations',
    },
    {
      id: 'restore',
      color: 'orange',
      icon: RestoreIcon,
      title: 'Restore settings',
      buttonTitle: 'RESTORE',
      description: 'Restore all configurations from a backup file',
    },
    {
      id: 'format',
      color: 'purple',
      icon: FormatIcon,
      title: 'Format Node SSD',
      buttonTitle: 'FORMAT',
      description:
        'Use this tool for formatting and setting up your Node NVMe SSD',
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
      setIsModalFormatOpen(true);
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