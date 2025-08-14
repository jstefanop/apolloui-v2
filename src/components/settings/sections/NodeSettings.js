import React from 'react';
import {
  Divider,
  Textarea,
  Input,
  InputGroup,
  InputLeftAddon,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Select
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { MdSettings } from 'react-icons/md';
import { NodeIcon } from '../../UI/Icons/NodeIcon';
import PanelCardNode from '../../UI/PanelCardNode';
import SimpleCard from '../../UI/SimpleCard';
import SimpleSwitchSettingsItem from '../../UI/SimpleSwitchSettingsItem';
import { useNodeSettings } from '../hooks/useNodeSettings';
import { useSettings } from '../context/SettingsContext';
import { useSelector, shallowEqual } from 'react-redux';
import { nodeSelector } from '../../../redux/reselect/node';
import { getNodeErrorMessage } from '../../../lib/utils';

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
          <Select
            mt={4}
            value={nodeSoftware}
            onChange={handleNodeSoftwareChange}
            color={inputTextColor}
          >
            <option value="core-latest">Bitcoin Core</option>
            <option value="knots-latest">Bitcoin Knots</option>
          </Select>
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