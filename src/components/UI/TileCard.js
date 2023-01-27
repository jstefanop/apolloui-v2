import { Icon, Text, Flex } from '@chakra-ui/react';
import { BulletList, Instagram } from 'react-content-loader';

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
}) => {
  return (
    <Card py="15px" bgColor={cardColor} h="100%">
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
          <IconBox
            w="56px"
            h="56px"
            bg={iconBgColor}
            icon={<Icon w="32px" h="32px" as={icon} color={iconColor} />}
            marginRight="5"
          />
          <Text color="white" fontSize={{ base: '4xl' }} fontWeight="800">
            {loading ? <LoadingIcon /> : mainData}
          </Text>
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
