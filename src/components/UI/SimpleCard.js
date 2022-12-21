import { Icon, Text, Flex, FormLabel, FormControl } from '@chakra-ui/react';
import Card from '../card/Card';

const SimpleCard = ({
  children,
  title,
  description,
  textColor,
  icon,
  ...rest
}) => {
  return (
    <Card
      bg='transparent'
      boxShadow='unset'
      px='24px'
      py='21px'
      transition='0.2s linear'
      {...rest}
    >
      <Flex direction={{ base: 'column' }} justify='center'>
        <Flex position='relative' align='center'>
          <FormControl display='flex'>
            <Flex direction='column' w={{ base: '90%', md: '100%' }}>
              {title && (
                <Flex>
                  {icon && (
                    <Icon
                      w='18px'
                      h='18px'
                      as={icon}
                      mr='6px'
                      mt='2px'
                      color='gray.400'
                    />
                  )}
                  <FormLabel
                    color={textColor}
                    fontSize={{
                      base: 'md',
                    }}
                    mb='6px'
                    fontWeight='bold'
                    me='14px'
                  >
                    {title}
                  </FormLabel>
                </Flex>
              )}
              {description && (
                <Text
                  color='secondaryGray.600'
                  fontSize={{ base: 'xs', lg: 'sm' }}
                  fontWeight='400'
                  me='14px'
                >
                  {description}
                </Text>
              )}
              {children}
            </Flex>
          </FormControl>
        </Flex>
      </Flex>
    </Card>
  );
};

export default SimpleCard;
