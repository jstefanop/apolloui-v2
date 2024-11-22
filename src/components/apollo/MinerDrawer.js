import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import _ from 'lodash';
import { displayHashrate } from '../../lib/utils';
import Card from '../card/Card';
import { BugIcon } from '../UI/Icons/BugIcon';
import { FanIcon } from '../UI/Icons/FanIcon';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import { MinerTempIcon } from '../UI/Icons/MinerTemp';
import { PowerIcon } from '../UI/Icons/PowerIcon';
import { VoltageIcon } from '../UI/Icons/VoltageIcon';
import { SharesRejectedIcon } from '../UI/Icons/SharesRejectedIcon';
import { SharesAcceptedIcon } from '../UI/Icons/SharesAcceptedIcon';
import { SharesSentIcon } from '../UI/Icons/SharesSentIcon';
import { DifficultyIcon } from '../UI/Icons/DifficultyIcon';
import PanelGrid from '../UI/PanelGrid';
import ActiveBadge from './ActiveBadge';

const MinerDrawer = ({ isOpen, onClose, placement, data }) => {
  const drawerBgColor = useColorModeValue('gray.200', 'brand.700');
  const cardColor = useColorModeValue('white', 'brand.800');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.2)'
  );

  const activeBoards = _.size(_.filter(data, { status: true }));
  const totalBoards = _.size(data);
  const activePools = _.size(_.filter(data, { poolStatus: true }));
  const dataSorted = _.orderBy(data, ['version'], ['desc']);

  const dataTableBoards = _.chain(dataSorted)
    .map((board) => {
      const items = {
        hashrate: displayHashrate(board.hashrateInGh, 'GH/s', true, 2),
        temperature: `${(board?.temperature) ? board.temperature.toFixed(0) : 'n.a.'}°C`,
        fanSPeed: `${(board?.fanSpeed) ? board.fanSpeed.toFixed(0) : 'n.a.'} rpm`,
        power: `${(board?.wattTotal) ? board.wattTotal.toFixed(0) : 'n.a.'} Watts`,
        voltage: `${(board?.voltage) ? board.voltage.toFixed(1) : 'n.a.'} A`,
        errorRate: `${(board?.errorRate > 0) ? board.errorRate.toFixed(1) : '0'}%`,
      };
      return Object.entries(items).map(([key, value]) => {
        let icon;
        switch (key) {
          case 'hashrate':
            icon = MinerIcon;
            break;
          case 'temperature':
            icon = MinerTempIcon;
            break;
          case 'fanSPeed':
            icon = FanIcon;
            break;
          case 'power':
            icon = PowerIcon;
            break;
          case 'voltage':
            icon = VoltageIcon;
            break;
          case 'errorRate':
            icon = BugIcon;
            break;
        }
        return { value, icon };
      });
    })
    .value();

  const dataTablePools = _.chain(dataSorted)
    .map((board) => {
      const items = {
        hashrate: displayHashrate(board.poolHashrateInGh, 'GH/s', true, 2),
        diff: board.diff,
        empty: null,
        sharesSent: board.sharesSent,
        sharesAccepted: board.sharesAccepted,
        sharesRejected: board.sharesRejected,
      };
      return Object.entries(items).map(([key, value]) => {
        let icon;
        switch (key) {
          case 'hashrate':
            icon = MinerIcon;
            break;
          case 'diff':
            icon = DifficultyIcon;
            break;
          case 'sharesSent':
            icon = SharesSentIcon;
            break;
          case 'sharesAccepted':
            icon = SharesAcceptedIcon;
            break;
          case 'sharesRejected':
            icon = SharesRejectedIcon;
            break;
        }
        return { value, icon };
      });
    })
    .value();

  return (
    <Drawer placement={placement} onClose={onClose} isOpen={isOpen} size="xl">
      <DrawerOverlay />
      <DrawerContent bgColor={drawerBgColor}>
        <DrawerCloseButton />
        <DrawerHeader fontSize="3xl">Hashboards and Pools</DrawerHeader>

        <DrawerBody>
          <Tabs size="md" align={'center'} isLazy variant={'line'}>
            <TabList>
              <Tab>
                <Text fontWeight={600} me="2">
                  Hashboards
                </Text>
                {typeof activeBoards !== 'undefined' &&
                  activeBoards !== null &&
                  typeof totalBoards !== 'undefined' &&
                  totalBoards !== null && (
                    <ActiveBadge
                      active={activeBoards}
                      total={totalBoards}
                      smaller
                    />
                  )}
              </Tab>
              <Tab>
                <Text fontWeight={600} me="2">
                  Pools
                </Text>
                {typeof activePools !== 'undefined' &&
                  activePools !== null &&
                  typeof totalBoards !== 'undefined' &&
                  totalBoards !== null && (
                    <ActiveBadge
                      active={activePools}
                      total={totalBoards}
                      smaller
                    />
                  )}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {dataTableBoards.map((board, index) => (
                  <Card
                    py="15px"
                    bgColor={cardColor}
                    boxShadow={shadow}
                    h="100%"
                    key={index}
                    my="15px"
                  >
                    <PanelGrid
                      title={`Hashboard #${index}`}
                      data={board}
                      status={dataSorted[index].status}
                      badgeText={dataSorted[index].chips}
                      version={dataSorted[index].version}
                      badgeSecondaryText="Active ASICs"
                      comport={dataSorted[index].comport}
                    />
                  </Card>
                ))}
              </TabPanel>
              <TabPanel>
                {dataTablePools.map((board, index) => (
                  <Card
                    py="15px"
                    bgColor={cardColor}
                    boxShadow={shadow}
                    h="100%"
                    key={index}
                    my="15px"
                  >
                    <PanelGrid
                      title={`${dataSorted[index].poolHost}:${dataSorted[index].poolPort}`}
                      data={board}
                      status={dataSorted[index].poolStatus}
                      badgeSecondaryText={dataSorted[index].poolUsername}
                      version={dataSorted[index].version}
                      comport={dataSorted[index].comport}
                    />
                  </Card>
                ))}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default MinerDrawer;
