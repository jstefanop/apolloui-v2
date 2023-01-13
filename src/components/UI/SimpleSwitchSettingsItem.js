import {
  Icon,
  Text,
  Flex,
  Switch,
  FormLabel,
  FormControl,
  SimpleGrid,
  Button,
  Checkbox,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { MdUndo, MdOutlineWarningAmber } from 'react-icons/md';
import SliderTooltip from './SliderTooltip';
import Card from '../card/Card';

const SimpleSwitchSettingsItem = ({
  item,
  textColor,
  sliderTextColor,
  inverted,
  handleButton,
  handleSwitch,
  handleCustomModeChange,
  handleCustomModeReset,
}) => {
  const cardBgColor = useColorModeValue('gray.50', 'secondaryGray.900');
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
              direction='row'
              w={{ base: '90%', md: '100%' }}
              me={{
                base: '4px',
                md: '32px',
                xl: '10px',
                '3xl': '32px',
              }}
            >
              {item.id && (
                <Flex
                  me={{ base: '4px', md: '32px', xl: '10px', '3xl': '32px' }}
                  mt='2px'
                >
                  {handleButton ? (
                    <Button
                      onChange={handleButton}
                      colorScheme={item.color}
                      size='sm'
                    >
                      {item.buttonTitle}
                    </Button>
                  ) : (
                    <Switch
                      id={`${item.id}`}
                      colorScheme={item.color}
                      onChange={handleSwitch}
                      value={item.selected}
                      isChecked={inverted ? !item.selected : item.selected}
                    />
                  )}
                </Flex>
              )}
              <Flex direction='column'>
                <Flex align={{ base: 'flex-start' }}>
                  <Flex>
                    <FormLabel
                      htmlFor={`${item.id}`}
                      color={textColor}
                      fontSize={{
                        base: 'md',
                      }}
                      mb='6px'
                      fontWeight='bold'
                      me='14px'
                    >
                      {item.title}
                    </FormLabel>
                  </Flex>
                  {item.alertBadge && (
                    <Flex>
                      <Badge variant='solid' colorScheme='gray'>
                        {item.alertBadge}
                      </Badge>
                    </Flex>
                  )}
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
            </Flex>
          </FormControl>
        </Flex>
        {item.sliders && item.selected && (
          <Flex
            direction='column'
            me={{
              base: '4px',
              md: '32px',
              xl: '10px',
              '3xl': '32px',
            }}
            mt='20px'
          >
            <SimpleGrid columns={{ base: 1, md: 1 }} gap='4'>
              {item.sliders.map((slider) => (
                <Card
                  key={slider.id}
                  p='20px'
                  variant='outline'
                  bg={cardBgColor}
                >
                  <Flex justify='space-between' align='center'>
                    <Flex alignItems='baseline'>
                      <Text
                        color={sliderTextColor}
                        fontSize={{ base: 'sm', lg: 'md' }}
                        fontWeight='600'
                        me='6px'
                      >
                        {slider.title}
                      </Text>
                      <Text
                        fontSize={'sm'}
                        color={sliderTextColor}
                        fontWeight='200'
                      >
                        {item[slider.id] || slider.min}
                        {slider.id === 'voltage' && '%'}
                        {slider.id.match(/fan/) && '°'}
                      </Text>
                    </Flex>
                    <Button
                      onClick={() => handleCustomModeReset(slider.id)}
                      h='24px'
                      variant='no-effects'
                      display='flex'
                      p='0px'
                      align='center'
                      justify='center'
                    >
                      <Icon
                        as={MdUndo}
                        width='18px'
                        height='18px'
                        color='inherit'
                      />
                    </Button>
                  </Flex>
                  <Text
                    color='secondaryGray.600'
                    fontSize={{ base: 'xs' }}
                    fontWeight='400'
                  >
                    {slider.description}
                  </Text>
                  <SliderTooltip
                    my='5'
                    width={'99%'}
                    value={item[slider.id] || slider.min}
                    minValue={slider.min}
                    maxValue={slider.max}
                    step={slider.step}
                    ranges={slider.data}
                    handleSliderChange={(v) =>
                      handleCustomModeChange(v, slider.id)
                    }
                    sliderId={slider.id}
                  ></SliderTooltip>
                </Card>
              ))}
              {item.voltage >= 75 && (
                <Card
                  p='20px'
                  bgColor={'red.400'}
                  color='white'
                  variant='outline'
                >
                  <Flex alignItems={'center'} mb={'1.5'}>
                    <Icon
                      as={MdOutlineWarningAmber}
                      w='24px'
                      h='24px'
                      mr={'2'}
                    />{' '}
                    <Text fontSize={'xl'} fontWeight={'600'} color={'white'}>
                      Warning
                    </Text>
                  </Flex>
                  <Text
                    fontSize={{ base: 'sm', lg: 'md' }}
                    fontWeight='600'
                    mb={'1.5'}
                  >
                    The FutureBit APU-200 Power Supply is limited to 75% power,
                    going beyond this will cause your system to shutdown. You
                    accept that Futurebit will not cover any warranty claims
                    past 75% power, and that you are using an external ATX power
                    supply that is capable of at least 300 watts per unit and
                    BOTH 6 pin connectors are plugged in
                  </Text>
                  <Checkbox>
                    <Text>I have read and accept</Text>
                  </Checkbox>
                </Card>
              )}
            </SimpleGrid>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default SimpleSwitchSettingsItem;
