import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Icon,
  Divider,
  Textarea,
  Input,
  InputGroup,
  InputLeftAddon,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdSettings, MdCheck } from 'react-icons/md';
import { NodeIcon } from '../../UI/Icons/NodeIcon';
import PanelCardNode from '../../UI/PanelCardNode';
import SimpleCard from '../../UI/SimpleCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useNodeSettings } from '../hooks/useNodeSettings';
import { useSettings } from '../context/SettingsContext';
import { useSelector, shallowEqual } from 'react-redux';
import { nodeSelector } from '../../../redux/reselect/node';
import { getNodeErrorMessage } from '../../../lib/utils';
import { getGroupedNodeSoftware } from '../../../lib/nodeSoftware';

const NodeSettings = () => {
  const intl = useIntl();
  const { settings, setIsModalConnectOpen } = useSettings();
  const {
    nodeTorMode,
    nodeAllowLan,
    nodeSoftware,
    nodeMaxConnections,
    nodeUserConf,
    errorDisallowedNodeConf,
    handleSwitchNodeTorMode,
    handleNodeAllowLan,
    handleNodeSoftwareChange,
    handleNodeMaxConnections,
    handleUserConfChange,
  } = useNodeSettings();

  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');
  const bgColor = useColorModeValue('white', 'navy.800');

  // Node software selector styling
  const swGroups = getGroupedNodeSoftware();
  const swSelectedBg = useColorModeValue('brand.500', 'brand.400');
  const swIdleBg = useColorModeValue('white', 'navy.700');
  const swIdleBorder = useColorModeValue('secondaryGray.400', 'whiteAlpha.300');
  const swIdleText = useColorModeValue('secondaryGray.900', 'gray.200');
  const swGroupLabel = useColorModeValue('secondaryGray.600', 'gray.400');

  // Node data from Redux
  const { data: dataNode, error: errorNode, loading: loadingNode } = useSelector(nodeSelector, shallowEqual);
  const { errorSentence: errorNodeSentence } = getNodeErrorMessage(errorNode, intl);

  // Handle button click to open connect modal
  const handleButtonClick = () => {
    setIsModalConnectOpen(true);
  };

  return (
    <>
      {/* Main Node Settings Panel */}
      <PanelCardNode
        title={intl.formatMessage({ id: 'settings.sections.node.title' })}
        description={intl.formatMessage({ id: 'settings.sections.node.description' })}
        textColor={textColor}
        icon={NodeIcon}
        handleButtonClick={handleButtonClick}
        buttonText={intl.formatMessage({ id: 'settings.sections.node.connect' })}
        buttonLoading={
          !settings?.nodeAllowLan ||
          errorNodeSentence ||
          loadingNode
        }
        mb={'20px'}
      >
        <SimpleCard title={intl.formatMessage({ id: 'settings.sections.node.software.title' })} textColor={textColor}>
          <Flex direction="column" gap="20px" mt={4}>
            {swGroups.map((group) => (
              <Box key={group.id}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={swGroupLabel}
                  mb="10px"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                >
                  {group.label}
                </Text>
                <Flex wrap="wrap" gap="10px">
                  {group.options.map((opt) => {
                    const isSelected = opt.value === nodeSoftware;
                    return (
                      <Flex
                        key={opt.value}
                        as="button"
                        type="button"
                        onClick={() => handleNodeSoftwareChange(opt.value)}
                        align="center"
                        justify="center"
                        gap="8px"
                        h="46px"
                        px="16px"
                        borderRadius="14px"
                        border="2px solid"
                        borderColor={isSelected ? swSelectedBg : swIdleBorder}
                        bg={isSelected ? swSelectedBg : swIdleBg}
                        color={isSelected ? 'white' : swIdleText}
                        fontWeight="600"
                        boxShadow={isSelected ? 'md' : 'none'}
                        transition="all 0.15s ease"
                        _hover={{
                          borderColor: swSelectedBg,
                          transform: 'translateY(-1px)',
                        }}
                      >
                        {isSelected && <Icon as={MdCheck} w="18px" h="18px" />}
                        <Text fontSize="md" lineHeight="1">
                          {opt.version}
                        </Text>
                        {opt.isDefault && (
                          <Badge
                            colorScheme={isSelected ? 'whiteAlpha' : 'gray'}
                            variant={isSelected ? 'solid' : 'subtle'}
                            borderRadius="full"
                            fontSize="0.6rem"
                            px="6px"
                          >
                            {intl.formatMessage({ id: 'settings.sections.node.software.default' })}
                          </Badge>
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
              </Box>
            ))}
          </Flex>
        </SimpleCard>

        <Divider mb="10px" mt="10px" />

        <SimpleSwitchSettingsItem
          item={nodeTorMode}
          textColor={textColor}
          sliderTextColor={sliderTextColor}
          handleSwitch={handleSwitchNodeTorMode}
        />
        {settings.nodeEnableSoloMining && nodeTorMode.selected && (
          <Alert mt="5" borderRadius={'10px'} status={'error'}>
            <AlertIcon />
            <AlertDescription>
              {intl.formatMessage({ id: 'settings.sections.node.solo_mining_warning' })}
            </AlertDescription>
          </Alert>
        )}

        <Divider mb="10px" />

        <SimpleSwitchSettingsItem
          item={nodeAllowLan}
          textColor={textColor}
          sliderTextColor={sliderTextColor}
          handleSwitch={handleNodeAllowLan}
        />

        <Divider mb="10px" />

        <SimpleCard title={intl.formatMessage({ id: 'settings.sections.node.extra_options' })} textColor={textColor}>
          <InputGroup mt={4}>
            <InputLeftAddon>{intl.formatMessage({ id: 'settings.sections.node.max_connections' })}</InputLeftAddon>
            <Input
              color={inputTextColor}
              name="nodeMaxConnections"
              type="number"
              placeholder={64}
              value={nodeMaxConnections}
              onChange={handleNodeMaxConnections}
              width="90px"
            />
          </InputGroup>
        </SimpleCard>
      </PanelCardNode>

      {/* Bitcoin Node Configuration Panel */}
      <SimpleCard
        title={intl.formatMessage({ id: 'settings.sections.node.node_config.title' })}
        description={intl.formatMessage({ id: 'settings.sections.node.node_config.description' })}
        textColor={textColor}
        icon={MdSettings}
        mb={'20px'}
        bg={bgColor}
      >
        <Textarea
          value={settings.nodeUserConf || ''}
          onChange={handleUserConfChange}
          mt="4"
          minH="200px"
        />

        {errorDisallowedNodeConf && (
          <Alert mt="5" borderRadius={'10px'} status={'warning'}>
            <AlertIcon />
            <AlertDescription>
              You inserted disallowed options which will be overwritten by the app: {JSON.stringify(
                errorDisallowedNodeConf
              )}
            </AlertDescription>
          </Alert>
        )}
      </SimpleCard>
    </>
  );
};

export default NodeSettings;