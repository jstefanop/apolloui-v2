import { Icon, Text, Flex, Button, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { MdCastConnected } from 'react-icons/md';
import Card from '../../components/card/Card';
import { useIntl } from 'react-intl';

const PanelCard = ({
  children,
  title,
  description,
  textColor,
  badgeColor,
  badgeText,
  buttonText,
  buttonLoading,
  handleButtonClick,
  icon,
  showHide,
  tooltip,
  ...rest
}) => {
  const intl = useIntl();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Flex flexDirection="column" {...rest}>
      <Card p="0px">
        <Flex
          align={{ sm: 'flex-start', lg: 'center' }}
          justify="space-between"
          w="100%"
          px="22px"
          pt="18px"
        >
          <Flex>
            <Icon w="20px" h="20px" as={icon} mr="8px" mt="4px" />
            <Text color={textColor} fontSize="xl" fontWeight="600">
              {title}
            </Text>
          </Flex>

          <Flex align-items="center">
            <>
              <Tooltip
                hasArrow
                bg={'gray.600'}
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={buttonLoading ? intl.formatMessage({ id: 'node.panel.connect_tooltip_loading' }) : intl.formatMessage({ id: 'node.panel.connect_tooltip' })}
              >
                <Button
                  leftIcon={<MdCastConnected />}
                  colorScheme={'gray'}
                  variant={'outline'}
                  size={'sm'}
                  mb={'2'}
                  onClick={handleButtonClick}
                  onMouseOver={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  isDisabled={buttonLoading}
                >
                  {buttonText}
                </Button>
              </Tooltip>
            </>
          </Flex>
        </Flex>
        <Flex px="22px" py="6px">
          <Text
            color="secondaryGray.800"
            fontSize={{ base: 'sm', lg: 'md' }}
            fontWeight="400"
            me="14px"
          >
            {description}
          </Text>
        </Flex>

        {children}
      </Card>
    </Flex>
  );
};

export default PanelCard;
