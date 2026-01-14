import { Icon, Text, Flex, Box } from '@chakra-ui/react';

import Card from '../card/Card';
import IconBox from '../icons/IconBox';
import LoadingIcon from './LoadingIcon';

const TileCard = ({
  icon,
  iconColor,
  iconBgColor,
  cardColor,
  secondaryTextColor,
  title,
  mainData,
  secondaryData,
  secondaryText,
  loading,
  errors,
  bannerImage,
  bigFont,
  ...props
}) => {

  return (
    <Card
      py="15px"
      h="100%"
      {...props}
      style={
        bannerImage && {
          backgroundImage: `url(${bannerImage.src})`,
          backgroundSize: 'cover',
        }
      }
    >
      <>
        <Flex marginBottom={'auto'}>
          <Text color="white" fontSize="lg" fontWeight="800">
            {title}
          </Text>
        </Flex>
        <Flex
          direction="column"
          align="center"
          justify="center"
          paddingBottom={secondaryData ? '8' : '0'}
          w="100%"
          minH="0"
        >
          {errors && (Array.isArray(errors) ? errors.length > 0 : true) ? (
            <>
              <Text color="white" fontSize={{ base: '4xl' }} fontWeight="800">
                Error
              </Text>
              {(Array.isArray(errors) ? errors : [errors]).map((error, index) => (
                <Text
                  key={index}
                  color={secondaryTextColor || 'gray'}
                  fontSize={{ base: 'md' }}
                >
                  {error?.message || error?.code || (typeof error === 'string' ? error : error?.toString?.() || 'Unknown error')}
                </Text>
              ))}
            </>
          ) : (
            <>
              <IconBox
                w={{ base: '60px', md: '70px', lg: '80px' }}
                h={{ base: '60px', md: '70px', lg: '80px' }}
                bg={iconBgColor}
                icon={<Icon w={{ base: '24px', md: '28px', lg: '32px' }} h={{ base: '24px', md: '28px', lg: '32px' }} as={icon} color={iconColor} />}
                mb="3"
              />
              <Box
                color="white"
                fontSize={{
                  base: '2.5rem',
                  md: '3rem',
                  lg: bigFont ? '4.5rem' : '3.5rem',
                  xl: bigFont ? '5rem' : '4rem',
                }}
                fontWeight="800"
                textAlign="center"
                lineHeight="1.2"
                maxW="100%"
                px="2"
                w="100%"
              >
                <Text
                  as="span"
                  color="white"
                  fontWeight="800"
                  display="inline-block"
                  whiteSpace="nowrap"
                >
                  {loading ? <LoadingIcon /> : mainData}
                </Text>
              </Box>
            </>
          )}
        </Flex>

        <Flex mx="auto" mt={'auto'} pb={'5'} flexDirection="column">
          {secondaryData && (
            <>
              <Text 
                mx="auto" 
                color="white" 
                fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} 
                fontWeight="800"
                textAlign="center"
                wordBreak="break-word"
                overflow="hidden"
              >
                {loading ? <LoadingIcon /> : secondaryData}
              </Text>
              <Text color={secondaryTextColor} fontSize="xs" fontWeight="800">
                {secondaryText}
              </Text>
            </>
          )}
        </Flex>
      </>
    </Card>
  );
};

export default TileCard;
