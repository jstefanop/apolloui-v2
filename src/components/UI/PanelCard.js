import {
  Icon,
  Text,
  Flex,
  Tag,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ImEye, ImEyeBlocked } from 'react-icons/im';
import { RiScan2Fill } from 'react-icons/ri';
import Card from '../../components/card/Card';

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [show, setSHow] = useState(false);

  return (
    <Flex flexDirection='column' {...rest}>
      <Card p='0px'>
        <Flex
          align={{ sm: 'flex-start', lg: 'center' }}
          justify='space-between'
          w='100%'
          px='22px'
          pt='18px'
        >
          <Flex>
            <Icon w='20px' h='20px' as={icon} mr='8px' mt='4px' />
            <Text color={textColor} fontSize='xl' fontWeight='600'>
              {title}
            </Text>
          </Flex>
          {buttonText && (
            <Flex align-items='center'>
              <Button
                isLoading={buttonLoading}
                loadingText='Scanning'
                leftIcon={<RiScan2Fill />}
                colorScheme={'gray'}
                variant={'outline'}
                size={'sm'}
                mb={'2'}
                onClick={handleButtonClick}
                disabled={buttonLoading}
              >
                {buttonText}
              </Button>
            </Flex>
          )}
          {badgeText && (
            <Flex align-items='center'>
              {showHide ? (
                <>
                  <Button onClick={() => setSHow(!show)} variant='link'>
                    <Icon
                      w='18px'
                      h='18px'
                      as={!show ? ImEye : ImEyeBlocked}
                      color={'gray.500'}
                    />
                  </Button>

                  <Tooltip
                    hasArrow
                    bg={'gray.600'}
                    color='white'
                    placement='top'
                    isOpen={showTooltip}
                    label={`This is your personal Bitcoin Node RPC password (username is futurebit, use these two values to connect external wallets/services directly to your BTC node)`}
                  >
                    <Tag
                      variant='solid'
                      colorScheme={badgeColor}
                      onMouseOver={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      {show ? badgeText : <Text fontSize='sm'>*********</Text>}
                    </Tag>
                  </Tooltip>
                </>
              ) : (
                <Tooltip
                  hasArrow
                  bg={'gray.600'}
                  color='white'
                placement='top'
                  isOpen={showTooltip}
                  label={`${tooltip}`}
                >
                    <Tag
                    variant='solid'
                    colorScheme={badgeColor}
                    onMouseOver={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    {badgeText}
                    </Tag>
                </Tooltip>
              )}
            </Flex>
          )}
        </Flex>
        <Flex px='22px' py='6px'>
          <Text
            color='secondaryGray.800'
            fontSize={{ base: 'sm', lg: 'md' }}
            fontWeight='400'
            me='14px'
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
