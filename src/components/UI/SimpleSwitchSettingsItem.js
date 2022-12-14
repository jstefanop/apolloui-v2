import {
  Icon,
  Text,
  Flex,
  Card,
  Switch,
  FormLabel,
  FormControl,
  useBoolean,
} from '@chakra-ui/react';

const SimpleSwitchSettingsItem = ({ item, textColor, handleSwitch }) => {
  return (
    <Card
      bg='transparent'
      boxShadow='unset'
      px='24px'
      py='21px'
      transition='0.2s linear'
    >
      <Flex direction={{ base: 'column' }} justify='center'>
        <Flex position='relative' align='center'>
          <FormControl display='flex'>
            <Flex
              direction='column'
              w={{ base: '90%', md: '100%' }}
              me={{
                base: '4px',
                md: '32px',
                xl: '10px',
                '3xl': '32px',
              }}
            >
              <Flex>
                <Icon w='24px' h='24px' as={item.icon} mr='6px' />

                <FormLabel
                  htmlFor={`${item.id}`}
                  color={textColor}
                  fontSize={{
                    base: 'md',
                  }}
                  mb='5px'
                  fontWeight='bold'
                  me='14px'
                >
                  {item.title}
                </FormLabel>
              </Flex>
              <Text
                color='secondaryGray.600'
                fontSize={{ base: 'xs', lg: 'sm' }}
                fontWeight='400'
                me='14px'
              >
                {item.description}
              </Text>
            </Flex>
          </FormControl>
          <Flex
            me={{ base: '4px', md: '32px', xl: '10px', '3xl': '32px' }}
            align='center'
          >
            <Switch
              id={`${item.id}`}
              colorScheme={item.color}
              onChange={handleSwitch}
              value={item.selected}
              isChecked={item.selected}
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default SimpleSwitchSettingsItem;
