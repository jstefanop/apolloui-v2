import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useIntl } from 'react-intl';
import { MdShield } from 'react-icons/md';

export const useNodeSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm } = useSettings();

  // Node tor mode settings
  const [nodeTorMode, setNodeTorMode] = useState({
    id: 'tor',
    color: 'green',
    icon: MdShield,
    title: intl.formatMessage({ id: 'settings.sections.node.tor_mode.title' }),
    selected: false,
    description: intl.formatMessage({ id: 'settings.sections.node.tor_mode.description' }),
  });

  // Node allow LAN settings
  const [nodeAllowLan, setNodeAllowLan] = useState({
    id: 'allowLan',
    color: 'green',
    icon: MdShield,
    title: intl.formatMessage({ id: 'settings.sections.node.allow_lan.title' }),
    selected: false,
    description: intl.formatMessage({ id: 'settings.sections.node.allow_lan.description' }),
  });

  // Node max connections
  const [nodeMaxConnections, setNodeMaxConnections] = useState(32);

  // Node user configuration
  const [nodeUserConf, setNodeUserConf] = useState('');
  const [errorDisallowedNodeConf, setErrorDisallowedNodeConf] = useState(false);

  // Disallowed node configuration options
  const disallowedNodeConf = [
    'server',
    'rpcuser',
    'rpcpassword',
    'daemon',
    'upnp',
    'uacomment',
    'maxconnections',
  ];

  // Initialize and update states when settings change
  useEffect(() => {
    if (!settings || settings.initial) return;

    setNodeTorMode((prev) => ({
      ...prev,
      selected: settings.nodeEnableTor || false,
    }));

    setNodeAllowLan((prev) => ({
      ...prev,
      selected: settings.nodeAllowLan || false,
    }));

    setNodeMaxConnections(settings.nodeMaxConnections || 32);

    setNodeUserConf(settings.nodeUserConf || '');
  }, [settings]);

  // Handle Tor mode switch
  const handleSwitchNodeTorMode = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setNodeTorMode({ ...nodeTorMode, selected: !v });
    setSettings({ ...settings, nodeEnableTor: !v });
  };

  // Handle Allow LAN switch
  const handleNodeAllowLan = (e) => {
    setErrorForm(null);
    const v = e.target.value === 'true' ? true : false;
    setNodeAllowLan({ ...nodeAllowLan, selected: !v });
    setSettings({ ...settings, nodeAllowLan: !v });
  };

  // Handle Max Connections change
  const handleNodeMaxConnections = (e) => {
    setErrorForm(null);
    const v = parseInt(e.target.value);
    setNodeMaxConnections(v);
    setSettings({ ...settings, nodeMaxConnections: v });
  };

  // Handle User Configuration change
  const handleUserConfChange = (e) => {
    const newUserConf = e.target.value;
    logDisallowedNodeConf(newUserConf, disallowedNodeConf);
    setNodeUserConf(newUserConf);
    setSettings({ ...settings, nodeUserConf: newUserConf });
  };

  // Validate user configuration
  const logDisallowedNodeConf = (userConf, disallowedVariables) => {
    // Split userConf into an array of lines
    const userConfLines = userConf.split('\n');

    // Extract variable names from non-empty lines using regex and filter out empty lines
    const userConfVariables = userConfLines
      .filter((line) => line.trim() !== '') // Filter out empty lines
      .map((line) => {
        const match = line.match(/^[^=\r\n]+/);
        return match ? match[0] : null;
      })
      .filter(Boolean); // Filter out null values

    // Find variables from userConfVariables that are present in disallowedVariables
    const disallowedVarsFound = userConfVariables.filter((variable) =>
      disallowedVariables.includes(variable)
    );

    // If at least one disallowed variable is found, log a message
    if (disallowedVarsFound.length > 0) {
      setErrorDisallowedNodeConf(disallowedVarsFound);
    } else {
      setErrorDisallowedNodeConf(false);
    }
  };

  // Open Connect Node Modal
  const handleOpenConnectModal = () => {
    // This will be implemented in the main component
  };

  return {
    nodeTorMode,
    nodeAllowLan,
    nodeMaxConnections,
    nodeUserConf,
    errorDisallowedNodeConf,
    handleSwitchNodeTorMode,
    handleNodeAllowLan,
    handleNodeMaxConnections,
    handleUserConfChange,
    handleOpenConnectModal,
  };
};