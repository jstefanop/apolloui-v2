import React, { useState } from 'react';
import {
  FormLabel,
  Select,
  Input,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { PoolIcon } from '../../UI/Icons/PoolIcon';
import PanelCard from '../../UI/PanelCard';
import SimpleCard from '../../UI/SimpleCard';
import { useSettings } from '../context/SettingsContext';
import { presetPools } from '../../../lib/utils';

const PoolSettings = () => {
  const { settings, setSettings, setErrorForm } = useSettings();
  const [pool, setPool] = useState();
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

  return (
    <PanelCard
      title={'Pooled settings'}
      description={'Manage pools configuration for your miner'}
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
          Select a pool
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
                Learn more about this pool
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
          <SimpleCard title={'URL'} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="url"
              type="text"
              placeholder={'stratum.slushpool.com:3333'}
              value={settings.pool.url}
              onChange={handlePoolChange}
              disabled={
                settings.nodeEnableSoloMining || (pool && pool.id !== 'custom')
              }
            />
          </SimpleCard>
        </GridItem>
        <GridItem colSpan={{ base: '', md: 2 }}>
          <SimpleCard title={'Username'} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="username"
              type="text"
              placeholder={'futurebit.worker'}
              value={settings.pool.username}
              onChange={handlePoolChange}
              disabled={settings.nodeEnableSoloMining}
            />
          </SimpleCard>
        </GridItem>
        <GridItem colSpan={{ base: '', md: 1 }}>
          <SimpleCard title={'Password'} textColor={textColor}>
            <Input
              color={inputTextColor}
              name="password"
              type="text"
              placeholder={'x'}
              value={settings.pool.password}
              onChange={handlePoolChange}
              disabled={settings.nodeEnableSoloMining}
            />
          </SimpleCard>
        </GridItem>
      </Grid>
    </PanelCard>
  );
};

export default PoolSettings;