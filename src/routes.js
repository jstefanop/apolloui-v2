import { Icon } from '@chakra-ui/react';
import {
  MdDeviceHub,
  MdSettings,
  MdHome,
  MdLogout,
  MdViewComfy,
  MdMemory,
} from 'react-icons/md';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Miner',
    layout: '/admin',
    path: '/miner',
    icon: <Icon as={MdMemory} width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Node',
    layout: '/admin',
    icon: <Icon as={MdDeviceHub} width='20px' height='20px' color='inherit' />,
    path: '/node',
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: '/settings',
    icon: <Icon as={MdSettings} width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Apps',
    layout: '/admin',
    path: '/apps',
    icon: <Icon as={MdViewComfy} width='20px' height='20px' color='inherit' />,
  },
  {
    name: 'Signout',
    layout: '/admin',
    path: '/signout',
    icon: <Icon as={MdLogout} width='20px' height='20px' color='inherit' />,
  },
];

export default routes;
