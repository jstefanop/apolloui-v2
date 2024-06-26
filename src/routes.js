import { AppsIcon } from './components/UI/Icons/AppsIcon';
import { DashboardIcon } from './components/UI/Icons/DashboardIcon';
import { MinerIcon } from './components/UI/Icons/MinerIcon';
import { NodeIcon } from './components/UI/Icons/NodeIcon';
import { SettingsIcon } from './components/UI/Icons/SettingsIcon';
import { SystemIcon } from './components/UI/Icons/SystemIcon';
import { GrUserWorker } from 'react-icons/gr';

const routes = [
  {
    name: 'Overview',
    layout: '/admin',
    path: '/overview',
    icon: <DashboardIcon width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Miner',
    layout: '/admin',
    path: '/miner',
    icon: <MinerIcon width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'SOLO Mining',
    layout: '/admin',
    path: '/solo-mining',
    children: true,
    icon: <GrUserWorker size='1.2em' color='inherit' />,
  },
  {
    name: 'Node',
    layout: '/admin',
    icon: <NodeIcon width='20px' height='20px' color='inherit' />,
    path: '/node',
  },
  {
    name: 'System',
    layout: '/admin',
    path: '/system',
    bottom: true,
    icon: <SystemIcon width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: '/settings',
    bottom: true,
    icon: <SettingsIcon width='20px' height='20px' color='inherit' />,
  },
];

export default routes;
