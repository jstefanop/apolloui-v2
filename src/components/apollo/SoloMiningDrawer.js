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
import moment from 'moment';
import Card from '../card/Card';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import { LastShareIcon } from '../UI/Icons/LastShareIcon';
import { SharesSentIcon } from '../UI/Icons/SharesSentIcon';
import { BlocksIcon } from '../UI/Icons/BlocksIcon';
import { GiDiamondTrophy } from 'react-icons/gi';
import PanelGrid from '../UI/PanelGrid';
import ActiveBadge from './ActiveBadge';
import { filterRecentShares, workerIsActive, calculateDailyChance, convertHashrateStringToValue } from '../../lib/utils';

const SoloMiningDrawer = ({
  isOpen,
  onClose,
  placement,
  data,
  user,
  difficulty,
  networkhashps,
}) => {
  const drawerBgColor = useColorModeValue('gray.200', 'brand.700');
  const cardColor = useColorModeValue('white', 'brand.800');
  const shadow = useColorModeValue(
    '0px 17px 40px 0px rgba(112, 144, 176, 0.2)'
  );

  const desiredKeys = [
    'hashrate5m',
    'hashrate1d',
    'lastshare',
    'shares',
    'bestever',
    'workername',
  ];

  const workerNames = [];
  const totalWorkers = _.size(data);
  const activeWorkers = _.size(filterRecentShares(data, 180));

  const dataTableWorkers = data
    .map((element) => {
      if (!element) return null;
      const mappedArray = [];
      let workerName = '';
      let lastShare = null;
      let isActive = false;

      desiredKeys.forEach((key) => {
        if (key in element) {
          let value, icon, name;
          switch (key) {
            case 'hashrate5m':
              name = 'Hashrate (5m)';
              value = `${element[key]} (5m)`;
              icon = MinerIcon;
              break;
            case 'hashrate1d':
              name = 'Hashrate (1d)';
              value = `${element[key]} (1d)`;
              icon = MinerIcon;
              break;
            case 'workername':
              name = 'Workername';
              workerName = element[key];
              break;
            case 'lastshare':
              name = 'Last Share';
              lastShare = element[key];
              value = `${moment(element[key], 'X').fromNow()}`;
              icon = LastShareIcon;
              break;
            case 'shares':
              name = 'Shares';
              value = `${element[key]?.toLocaleString('en-US')}`;
              icon = SharesSentIcon;
              break;
            case 'bestever':
              name = 'Best ever';
              value =
                difficulty > 0
                  ? `${element[key].toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}`
                  : 'n.a.';
              icon = BlocksIcon;
              break;
          }
          if (value || icon) {
            mappedArray.push({ name, value, icon });
          }
        }
      });

      // Add daily chance calculation
      if (element.hashrate5m && networkhashps) {
        const hashrateValue = convertHashrateStringToValue(element.hashrate5m, 'GH/s');
        const dailyChance = calculateDailyChance(hashrateValue, networkhashps);
        if (dailyChance !== null) {
          mappedArray.push({
            name: 'Daily chance',
            value: `1 in ${dailyChance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            icon: GiDiamondTrophy ,
          });
        }
      }

      if (lastShare !== null) {
        isActive = workerIsActive(lastShare, 180);
      }
      return { workername: workerName, active: isActive, data: mappedArray };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return a.workername.localeCompare(b.workername);
    });

  return (
    <Drawer placement={placement} onClose={onClose} isOpen={isOpen} size="xl">
      <DrawerOverlay />
      <DrawerContent bgColor={drawerBgColor}>
        <DrawerCloseButton />
        <DrawerHeader fontSize="3xl">{user}</DrawerHeader>

        <DrawerBody>
          <Tabs size="md" align={'center'} isLazy variant={'line'}>
            <TabList>
              <Tab>
                <Text fontWeight={600} me="2">
                  Workers
                </Text>
                {typeof activeWorkers !== 'undefined' &&
                  activeWorkers !== null &&
                  typeof totalWorkers !== 'undefined' &&
                  totalWorkers !== null && (
                    <ActiveBadge
                      active={activeWorkers}
                      total={totalWorkers}
                      smaller
                    />
                  )}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {dataTableWorkers.map((worker, index) => (
                  <Card
                    py="15px"
                    bgColor={cardColor}
                    boxShadow={shadow}
                    h="100%"
                    key={index}
                    my="15px"
                  >
                    <PanelGrid
                      title={`Worker ${worker.workername}`}
                      data={worker.data}
                      showName={true}
                      status={worker.active}
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

export default SoloMiningDrawer;
