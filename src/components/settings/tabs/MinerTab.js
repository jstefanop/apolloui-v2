import React from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import MinerModeSettings from '../sections/MinerModeSettings';
import FanSettings from '../sections/FanSettings';
import PowerLedSettings from '../sections/PowerLedSettings';

const MinerTab = () => {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
      }}
      gap="20px"
      mb="20px"
    >
      <GridItem>
        <MinerModeSettings />
      </GridItem>
      <GridItem>
        <FanSettings />
        <PowerLedSettings />
      </GridItem>
    </Grid>
  );
};

export default MinerTab;