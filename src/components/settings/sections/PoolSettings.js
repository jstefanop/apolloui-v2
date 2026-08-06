import React, { useState, useEffect, useMemo } from 'react';
import {
  Badge,
  FormLabel,
  Select,
  Input,
  Switch,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { PoolIcon } from '../../UI/Icons/PoolIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import Card from '../../card/Card';
import { useSettings } from '../context/SettingsContext';
import { useDeviceConfig } from '../../../contexts/DeviceConfigContext';
import {
  buildPoolOptions,
  findPoolOption,
  matchPoolOption,
  suggestPoolName,
} from '../../../lib/poolOptions';

const PoolSettings = () => {
  const intl = useIntl();
  const {
    settings,
    setSettings,
    setErrorForm,
    poolProfiles = [],
    poolToSave,
    setPoolToSave,
    poolIsUnsaved,
  } = useSettings();
  // Backup pool is an Apollo III-only feature: hidden without an internal III,
  // badged "Apollo III only" in hybrid (mixed III + USB), plain on pure III.
  const { minerFamily, isHybrid } = useDeviceConfig();
  // The backup pool is an Apollo III capability.
  const isApolloIii = minerFamily === 'apollo-iii';
  const [pool, setPool] = useState();
  const [backupPreset, setBackupPreset] = useState();

  // Presets plus whatever the user kept, addressed by key rather than by
  // position: saved pools sort in by name, so an index means a different pool
  // as soon as one is added.
  const poolOptions = useMemo(() => buildPoolOptions(poolProfiles), [poolProfiles]);

  // Reopening the page used to show an empty select over a configured pool,
  // because the selection lived only in local state. Match on what is actually
  // saved instead — including a pool the user kept, which is why this waits for
  // the profiles to arrive.
  useEffect(() => {
    setPool((current) => current ?? matchPoolOption(poolOptions, settings?.pool));
  }, [poolOptions, settings?.pool]);

  useEffect(() => {
    setBackupPreset((current) => current ?? matchPoolOption(poolOptions, settings?.backupPool));
  }, [poolOptions, settings?.backupPool]);
  const textColor = useColorModeValue('brands.900', 'white');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');
  // Same recipe as the wifi panel's "connected to" card: a tinted block so the
  // backup pool reads as its own thing instead of more fields under the primary.
  const panelBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  // Kept in settings, not in local state, so the save path and the
  // unsaved-changes detection see it like any other field.
  const backupPool = settings.backupPool || { enabled: false };

  const updateBackupPool = (changes) => {
    setSettings({
      ...settings,
      backupPool: { ...backupPool, ...changes },
    });
  };

  const handleBackupPoolToggle = (e) => {
    setErrorForm(null);
    updateBackupPool({ enabled: e.target.checked });
  };

  const handleBackupPoolPreset = (e) => {
    const option = findPoolOption(poolOptions, e.target.value);
    if (option && !option.isCustom) {
      updateBackupPool(
        option.saved
          ? {
              url: option.url,
              username: option.username ?? '',
              password: option.password ?? '',
            }
          : { url: option.url }
      );
    }
    setBackupPreset(option);
  };

  const handleBackupPoolChange = (e) => {
    setErrorForm(null);
    updateBackupPool({ [e.target.name]: e.target.value });
  };

  const handlePoolPreset = (e) => {
    const option = findPoolOption(poolOptions, e.target.value);

    if (option && !option.isCustom) {
      const poolChanged = { ...settings.pool, url: option.url };

      // A saved pool is a whole pool, not just an endpoint — that is what makes
      // it worth keeping. Presets carry no worker, so theirs is left alone.
      if (option.saved) {
        poolChanged.username = option.username ?? '';
        poolChanged.password = option.password ?? '';
      }

      setSettings({
        ...settings,
        nodeEnableSoloMining: false,
        pool: poolChanged,
      });
    }

    setPool(option);
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
          value={pool?.key ?? ''}
          disabled={settings.nodeEnableSoloMining}
        >
          <option value=""></option>
          {poolOptions.map((item) => (
            <option value={item.key} key={item.key}>
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
                settings.nodeEnableSoloMining || (pool && !pool.isCustom)
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

      {/* Under the fields it belongs to, not up in the action bar: there it sat
          half a screen from Save and went unnoticed. Shown for any change to the
          pool — putting your own worker on a preset is the ordinary case. */}
      {poolIsUnsaved && (
        <SimpleCard title={''} textColor={textColor}>
          <Flex align="center" justify="space-between" wrap="wrap" gap="3">
            <Flex align="center" gap="3">
              <Switch
                id="savePoolProfile"
                isChecked={!!poolToSave?.enabled}
                onChange={(e) =>
                  setPoolToSave({
                    enabled: e.target.checked,
                    // Seeded from the host so the common case is one click, and
                    // never overwritten once the user has typed.
                    name: poolToSave?.name || suggestPoolName(settings?.pool?.url),
                  })
                }
              />
              <FormLabel
                htmlFor="savePoolProfile"
                color={textColor}
                fontWeight="bold"
                mb="0"
                _hover={{ cursor: 'pointer' }}
              >
                {intl.formatMessage({ id: 'settings.actions.save_pool' })}
              </FormLabel>
            </Flex>
            {poolToSave?.enabled && (
              <Input
                color={inputTextColor}
                maxW={{ base: '100%', md: '320px' }}
                value={poolToSave.name}
                onChange={(e) => setPoolToSave({ ...poolToSave, name: e.target.value })}
                placeholder={intl.formatMessage({ id: 'settings.actions.save_pool_name' })}
              />
            )}
          </Flex>
          <Text fontSize="sm" color="gray.500" mt="2">
            {intl.formatMessage({ id: 'settings.actions.save_pool_hint' })}
          </Text>
        </SimpleCard>
      )}

      {isApolloIii && (
        <>
      <Card bg={panelBg} p="16px" mt="20px" mb="20px" borderRadius="12px">
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
            value={backupPreset?.key ?? ''}
            disabled={settings.nodeEnableSoloMining}
          >
            <option value=""></option>
            {poolOptions.map((item) => (
              <option value={item.key} key={item.key}>
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
                  settings.nodeEnableSoloMining || (backupPreset && !backupPreset.isCustom)
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
      </Card>
        </>
      )}
    </PanelCard>
  );
};

export default PoolSettings;