import { Icon } from '@chakra-ui/react';
import { ImSpinner2 } from 'react-icons/im';

const LoadingIcon = ({ ...props }) => {
  return <Icon as={ImSpinner2} className='loaderIcon' {...props} />
}

export default LoadingIcon;