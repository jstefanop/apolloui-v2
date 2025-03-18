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
  useColorModeValue
} from '@chakra-ui/react';
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
  const { settings, setIsModalConnectOpen } = useSettings();
  const {
    nodeTorMode,
    nodeAllowLan,
    nodeMaxConnections,
    nodeUserConf,
    errorDisallowedNodeConf,
    handleSwitchNodeTorMode,
    handleNodeAllowLan,
    handleNodeMaxConnections,
    handleUserConfChange,
  } = useNodeSettings();

  const textColor = useColorModeValue('brands.900', 'white');
  const sliderTextColor = useColorModeValue('secondaryGray.800', 'gray.300');
  const inputTextColor = useColorModeValue('gray.900', 'gray.300');

  // Node data from Redux
  const { data: dataNode, error: errorNode, loading: loadingNode } = useSelector(nodeSelector, shallowEqual);
  const { errorSentence: errorNodeSentence } = getNodeErrorMessage(errorNode);

  // Handle button click to open connect modal
  const handleButtonClick = () => {
    setIsModalConnectOpen(true);
  };

  return (
    <PanelCardNode
      title={'Bitcoin node settings'}
      description={'Manage Bitcoin Node Configuration'}
      textColor={textColor}
      icon={NodeIcon}
      handleButtonClick={handleButtonClick}
      buttonText="Connect"
      buttonLoading={
        !settings?.nodeAllowLan ||
        errorNodeSentence ||
        loadingNode
      }
      mb={'20px'}
    >
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
            You have solo mining enabled, it is suggested to turn off
            tor for solo mining. Bitcoin nodes over the tor network
            propagate blocks slower, and there is a higher chance of
            orphaning a block
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

      <SimpleCard title={'Extra options'} textColor={textColor}>
        <InputGroup mt={4}>
          <InputLeftAddon>Max connections</InputLeftAddon>
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

      <Divider mb="10px" />

      <SimpleCard
        title={'Bitcoin node configuration'}
        description={
          'Add additional configuration lines to the bitcoin.conf file. (Note: this section is for advanced users, and no validation is performed. Please check Bitcoin Core documentation for valid options.)'
        }
        textColor={textColor}
        icon={MdSettings}
      >
        <Textarea
          value={settings.nodeUserConf || ''}
          onChange={handleUserConfChange}
          mt="4"
        />
      </SimpleCard>

      {errorDisallowedNodeConf && (
        <SimpleCard
          secondaryTextColor={'orange.500'}
          description={`You inserted disallowed options which will be overwritten by the app: ${JSON.stringify(
            errorDisallowedNodeConf
          )}`}
        />
      )}
    </PanelCardNode>
  );
};

export default NodeSettings;