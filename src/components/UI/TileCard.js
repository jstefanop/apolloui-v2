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
  ...props
}) => {
  return (
    <Card
      py="15px"
      h="100%"
      {...props}
      style={bannerImage && {
        backgroundImage: `url(${bannerImage.src})`,
        backgroundSize: 'cover',
      }}
    >
      <>
        <Flex marginBottom={'auto'}>
          <Text color="white" fontSize="lg" fontWeight="800">
            {title}
          </Text>
        </Flex>
        <Flex
          justify={{ base: 'center' }}
          paddingBottom={secondaryData ? '8' : '0'}
        >
          {errors.length ? (
            <>
              <Text
                color="white"
                fontSize={{ base: '4xl' }}
                fontWeight="800"
              ></Text>
              {errors.map((error, index) => {
                <Text
                  key={index}
                  color={secondaryTextColor || 'gray'}
                  fontSize={{ base: 'md' }}
                >
                  {error?.message || error?.code || error.toString()}
                </Text>;
              })}
            </>
          ) : (
            <>
              <IconBox
                w="80px"
                h="80px"
                bg={iconBgColor}
                icon={<Icon w="32px" h="32px" as={icon} color={iconColor} />}
                marginRight="5"
              />
              <Text
                color="white"
                fontSize={{ base: '4xl' }}
                fontWeight="800"
                minW="180px"
                my="auto"
              >
                {loading ? <LoadingIcon /> : mainData}
              </Text>
            </>
          )}
        </Flex>

        <Flex mx="auto" mt={'auto'} pb={'5'} flexDirection="column">
          {secondaryData && (
            <>
              <Text mx="auto" color="white" fontSize="2xl" fontWeight="800">
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
