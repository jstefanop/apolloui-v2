import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys)

// define the base component styles
const baseStyle = definePartsStyle({
  item: {
    // this will style the MenuItem and MenuItemOption components
    fontSize: 'sm',
    fontWeight: '500',
    color: 'blue.800',
    _hover: {
      color: 'white',
      bg: 'blue.800',
    }
  },
  groupTitle: {
    color: 'blue.800',
  },
  divider: {
    // this will style the MenuDivider component
    my: '2',
    borderColor: 'gray.300',
  },
})
// export the base styles in the component theme
export const menuStyles = defineMultiStyleConfig({ baseStyle })