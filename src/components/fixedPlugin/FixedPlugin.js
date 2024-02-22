// Chakra Imports
import {
  Button,
  Icon,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
// Custom Icons
import { IoMdMoon, IoMdSunny } from 'react-icons/io';

const FixedPlugin = ({ type }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'secodaryGray.700');
  let bgButton = 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)';

  return (
    <>
      {type === 'small' ? (
        <Button
          onClick={toggleColorMode}
          display="flex"
          p="0px"
          align="center"
          justify="center"
          bg={bgColor}
        >
          <Icon
            h="18px"
            w="18px"
            color="gray"
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </Button>
      ) : type === 'medium' ? (
        <Button
          h="30px"
          w="30px"
          bg={bgButton}
          zIndex="99"
          position="fixed"
          variant="no-effects"
          left={''}
          left={'26px'}
          bottom="20px"
          border="1px solid"
          borderColor="#6A53FF"
          borderRadius="50px"
          onClick={toggleColorMode}
          display="flex"
          p="0px"
          align="center"
          justify="center"
        >
          <Icon
            h="16px"
            w="16px"
            color="white"
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </Button>
      ) : (
        <Button
          h="60px"
          w="60px"
          bg={bgButton}
          zIndex="99"
          position="fixed"
          variant="no-effects"
          left={''}
          right={'35px'}
          bottom="30px"
          border="1px solid"
          borderColor="#6A53FF"
          borderRadius="50px"
          onClick={toggleColorMode}
          display="flex"
          p="0px"
          align="center"
          justify="center"
        >
          <Icon
            h="24px"
            w="24px"
            color="white"
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </Button>
      )}
    </>
  );
};

export default FixedPlugin;
