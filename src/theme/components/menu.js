import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

// define the base component styles
const baseStyle = definePartsStyle({
  list: {
    // this will style the MenuList component
    bg: 'white',
    _dark: {
      bg: 'brand.800',
    },
  },
  item: {
    // this will style the MenuItem and MenuItemOption components
    fontSize: 'sm',
    fontWeight: '500',
    color: 'brand.800',
    bg: 'white',
    _dark: {
      color: 'white',
      bg: 'brand.800',
    },
    _hover: {
      color: 'white',
      bg: 'brand.800',
      _dark: {
        color: 'brand.800',
        bg: 'white',
      },
    },
  },
  groupTitle: {
    color: 'brand.800',
    bg: 'white',
    _dark: {
      color: 'white',
      bg: 'brand.800',
    },
  },
  divider: {
    // this will style the MenuDivider component
    my: '2',
    borderColor: 'gray.300',
  },
});
// export the base styles in the component theme
export const menuStyles = defineMultiStyleConfig({ baseStyle });
