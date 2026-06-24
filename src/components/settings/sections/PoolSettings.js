import React, { useState } from 'react';
import {
  Badge,
  FormLabel,
  Select,
  Input,
  Flex,
  Grid,
  GridItem,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { PoolIcon } from '../../UI/Icons/PoolIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';
import { useDeviceConfig } from '../../../contexts/DeviceConfigContext';
import { presetPools } from '../../../lib/utils';

const PoolSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm } = useSettings();
  // Backup pool is an Apollo III-only feature: hidden without an internal III,
  // badged "Apollo III only" in hybrid (mixed III + USB), plain on pure III.
  const { hasInternalMiner, isHybrid } = useDeviceConfig();
  const [pool, setPool] = useState();
  const [backupPreset, setBackupPreset] = useState();
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

  const handlePoolPreset = (e) => {
    const preset = presetPools[e.target.value];
    if (preset && preset.id !== 'custom') {
      const poolChanged = {
        ...settings.pool,
      };

      poolChanged.url = preset.url;

      setSettings({
        ...settings,
        nodeEnableSoloMining: false,
        pool: poolChanged,
      });
    }

    setPool(preset);
  };

  const handlePoolChange = (e) => {
    setErrorForm(null);

    const poolChanged = {
      ...settings.pool,
    };

    poolChanged[e.target.name] = e.target.value;

    setSettings({
      ...settings,
      nodeEnableSoloMining: false,
      pool: poolChanged,
    });
  };

  const handleBackupPoolChange = (e) => {
    setErrorForm(null);

    const backupChanged = {
      ...(settings.backupPool || { enabled: false, password: 'x', index: 2 }),
    };

    backupChanged[e.target.name] = e.target.value;

    setSettings({
      ...settings,
      backupPool: backupChanged,
    });
  };

  const handleBackupPoolPreset = (e) => {
    const preset = presetPools[e.target.value];
    const current = settings.backupPool || {
      enabled: true,
      url: '',
      username: '',
      password: 'x',
      index: 2,
    };
    const next = { ...current };
    if (preset && preset.id !== 'custom') next.url = preset.url;
    setSettings({ ...settings, backupPool: next });
    setBackupPreset(preset);
  };

  const handleBackupPoolToggle = (e) => {
    setErrorForm(null);

    setSettings({
      ...settings,
      backupPool: {
        ...(settings.backupPool || { url: '', username: '', password: 'x', index: 2 }),
        enabled: e.target.checked,
      },
    });
  };

  const backupPool = settings.backupPool || {
    enabled: false,
    url: '',
    username: '',
    password: 'x',
  };

  return (
    <PanelCard
      title={intl.formatMessage({ id: 'settings.sections.pool.title' })}
      description={intl.formatMessage({ id: 'settings.sections.pool.description' })}
      textColor={textColor}
      icon={PoolIcon}
    >
      <SimpleCard title={''} textColor={textColor}>
        <FormLabel
          display="flex"
          htmlFor={'poolPreset'}
          color={textColor}
          fontWeight="bold"
          _hover={{ cursor: 'pointer' }}
        >
          {intl.formatMessage({ id: 'settings.sections.pool.select_pool' })}
        </FormLabel>
        <Select
          id="poolPreset"
          isRequired={true}
          fontSize="sm"
          label="Select a pool *"
          onChange={handlePoolPreset}
          disabled={settings.nodeEnableSoloMining}
        >
          <option></option>
          {presetPools.map((item, index) => (
            <option
              value={index}
              key={index}
              selected={pool && item.name === pool.name}
            >
              {item.name}
            </option>
          ))}
        </Select>
        {pool && pool.webUrl && (
          <Flex flexDir="row" mt="2">
            <a href={pool.webUrl} target="_blank" rel="noreferrer">
              <Text fontSize={'sm'}>
                {intl.formatMessage({ id: 'settings.sections.pool.learn_more' })}
              </Text>
            </a>
          </Flex>
        )}
      </SimpleCard>

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(6, 1fr)',
        }}
        gap={2}
      >
        <GridItem colSpan={{ base: '', md: 3 }}>
          <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.url.title' })} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="url"
              type="text"
              placeholder={intl.formatMessage({ id: 'settings.sections.pool.url.placeholder' })}
              value={settings.pool.url}
              onChange={handlePoolChange}
              disabled={
                settings.nodeEnableSoloMining || (pool && pool.id !== 'custom')
              }
            />
          </SimpleCard>
        </GridItem>
        <GridItem colSpan={{ base: '', md: 2 }}>
          <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.username.title' })} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="username"
              type="text"
              placeholder={intl.formatMessage({ id: 'settings.sections.pool.username.placeholder' })}
              value={settings.pool.username}
              onChange={handlePoolChange}
              disabled={settings.nodeEnableSoloMining}
            />
          </SimpleCard>
        </GridItem>
        <GridItem colSpan={{ base: '', md: 1 }}>
          <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.password.title' })} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="password"
              type="text"
              placeholder={intl.formatMessage({ id: 'settings.sections.pool.password.placeholder' })}
              value={settings.pool.password}
              onChange={handlePoolChange}
              disabled={settings.nodeEnableSoloMining}
            />
          </SimpleCard>
        </GridItem>
      </Grid>

      {hasInternalMiner && (
        <>
      <SimpleCard title={''} textColor={textColor}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex align="center">
            <FormLabel
              htmlFor="backupPoolEnabled"
              color={textColor}
              fontWeight="bold"
              mb="0"
              _hover={{ cursor: 'pointer' }}
            >
              {intl.formatMessage({ id: 'settings.sections.pool.backup.title' })}
            </FormLabel>
            {isHybrid && (
              <Badge variant="solid" colorScheme="gray">
                {intl.formatMessage({ id: 'settings.sections.pool.backup.apollo_iii_only' })}
              </Badge>
            )}
          </Flex>
          <Switch
            id="backupPoolEnabled"
            isChecked={!!backupPool.enabled}
            onChange={handleBackupPoolToggle}
            isDisabled={settings.nodeEnableSoloMining}
          />
        </Flex>
        <Text fontSize="sm" color="gray.500" mt="1">
          {intl.formatMessage({ id: 'settings.sections.pool.backup.description' })}
        </Text>
      </SimpleCard>

      {backupPool.enabled && (
        <SimpleCard title={''} textColor={textColor}>
          <FormLabel
            display="flex"
            htmlFor={'backupPoolPreset'}
            color={textColor}
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            {intl.formatMessage({ id: 'settings.sections.pool.select_pool' })}
          </FormLabel>
          <Select
            id="backupPoolPreset"
            isRequired={true}
            fontSize="sm"
            label="Select a backup pool *"
            onChange={handleBackupPoolPreset}
            disabled={settings.nodeEnableSoloMining}
          >
            <option></option>
            {presetPools.map((item, index) => (
              <option
                value={index}
                key={index}
                selected={backupPreset && item.name === backupPreset.name}
              >
                {item.name}
              </option>
            ))}
          </Select>
          {backupPreset && backupPreset.webUrl && (
            <Flex flexDir="row" mt="2">
              <a href={backupPreset.webUrl} target="_blank" rel="noreferrer">
                <Text fontSize={'sm'}>
                  {intl.formatMessage({ id: 'settings.sections.pool.learn_more' })}
                </Text>
              </a>
            </Flex>
          )}
        </SimpleCard>
      )}

      {backupPool.enabled && (
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(6, 1fr)',
          }}
          gap={2}
        >
          <GridItem colSpan={{ base: '', md: 3 }}>
            <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.url.title' })} textColor={textColor}>
              <Input
                color={inputTextColor}
                name="url"
                type="text"
                placeholder={intl.formatMessage({ id: 'settings.sections.pool.url.placeholder' })}
                value={backupPool.url || ''}
                onChange={handleBackupPoolChange}
                disabled={
                  settings.nodeEnableSoloMining || (backupPreset && backupPreset.id !== 'custom')
                }
              />
            </SimpleCard>
          </GridItem>
          <GridItem colSpan={{ base: '', md: 2 }}>
            <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.username.title' })} textColor={textColor}>
              <Input
                color={inputTextColor}
                name="username"
                type="text"
                placeholder={intl.formatMessage({ id: 'settings.sections.pool.username.placeholder' })}
                value={backupPool.username || ''}
                onChange={handleBackupPoolChange}
                disabled={settings.nodeEnableSoloMining}
              />
            </SimpleCard>
          </GridItem>
          <GridItem colSpan={{ base: '', md: 1 }}>
            <SimpleCard title={intl.formatMessage({ id: 'settings.sections.pool.password.title' })} textColor={textColor}>
              <Input
                color={inputTextColor}
                name="password"
                type="text"
                placeholder={intl.formatMessage({ id: 'settings.sections.pool.password.placeholder' })}
                value={backupPool.password || ''}
                onChange={handleBackupPoolChange}
                disabled={settings.nodeEnableSoloMining}
              />
            </SimpleCard>
          </GridItem>
        </Grid>
      )}
        </>
      )}
    </PanelCard>
  );
};

export default PoolSettings;