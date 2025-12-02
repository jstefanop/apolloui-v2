import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLazyQuery } from '@apollo/client';
import { useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { useIntl } from 'react-intl';

import { MINER_RESTART_QUERY } from '../graphql/miner';
import { AUTH_LOGIN_QUERY, SAVE_SETUP_QUERY } from '../graphql/auth';
import { SET_POOLS_QUERY } from '../graphql/pools';
import { SET_SETTINGS_QUERY } from '../graphql/settings';
import { NODE_STATS_QUERY } from '../graphql/node';
import { isValidBitcoinAddress, presetPools } from '../lib/utils';
import { useDeviceConfig } from '../contexts/DeviceConfigContext';

// Components
import StepWelcome from '../components/setup/StepWelcome';
import StepMiningType from '../components/setup/StepMiningType';
import StepWallet from '../components/setup/StepWallet';
import StepPool from '../components/setup/StepPool';
import StepPassword from '../components/setup/StepPassword';
import StepComplete from '../components/setup/StepComplete';

const Setup = () => {
  const router = useRouter();
  const intl = useIntl();
  const textColor = useColorModeValue('brand.800', 'white');
  const { deviceType } = useDeviceConfig();
  const isSoloNode = deviceType === 'solo-node';

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState();
  const [soloMining, setSoloMining] = useState(false);
  const [pool, setPool] = useState();
  const [poolUsername, setPoolUsername] = useState('');
  const [poolPassword, setPoolPassword] = useState('');
  const [poolUrl, setPoolUrl] = useState('');
  const [poolError, setPoolError] = useState();
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [token, setToken] = useState();
  const [isNodeSynced, setIsNodeSynced] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [restartMiner, { loading: loadingMinerRestart }] = useLazyQuery(
    MINER_RESTART_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [saveSetup, { data: dataSaveSetup, error: errorSaveSetup, loading: loadingSaveSetup }] =
    useLazyQuery(SAVE_SETUP_QUERY, { fetchPolicy: 'no-cache' });

  const [signin, { data: dataSignin, error: errorSignin, loading: loadingSignin }] = useLazyQuery(
    AUTH_LOGIN_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const [createPool] = useLazyQuery(SET_POOLS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const [saveSettings] = useLazyQuery(SET_SETTINGS_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const [getNodeStatus, { data: nodeStatusData }] =
    useLazyQuery(NODE_STATS_QUERY);

  useEffect(() => {
    if (dataSaveSetup?.Auth?.setup?.error)
      setError(dataSaveSetup.Auth.setup.error.message);
    if (dataSignin?.Auth?.login?.error)
      setError(dataSignin.Auth.login.error.message);
    if (errorSignin) setError(errorSignin.message);
    if (errorSaveSetup) setError(errorSaveSetup.message);

    if (dataSignin?.Auth?.login?.result) {
      const accessToken = dataSignin.Auth.login.result.accessToken;
      setToken(accessToken);
      // Save token immediately when available
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }
    }
  }, [dataSaveSetup, dataSignin, errorSignin, errorSaveSetup]);

  useEffect(() => {
    // Only proceed if setup is complete AND token is available
    if (!isComplete || !token) return;

    // Token is already saved in the previous useEffect when it becomes available
    // Now we can safely make authenticated requests

    if (soloMining) {
      saveSettings({
        variables: { input: { nodeEnableSoloMining: true } },
      });
    }

    createPool({
      variables: {
        input: {
          enabled: true,
          url: poolUrl,
          username: poolUsername,
          password: poolPassword,
          index: 1,
        },
      },
    });
  }, [
    isComplete,
    token,
    soloMining,
    poolUrl,
    poolUsername,
    poolPassword,
    createPool,
    saveSettings,
  ]);

  useEffect(() => {
    setPoolError(null);
    setError(null);
    onClose();
    if (step === 'mining') {
      setPoolUsername('');
      setPoolPassword('');
      setPoolUrl('');
      setPool(null);
      setSoloMining(false);
      setPassword('');
      setVerifyPassword('');
    }
  }, [step, onClose]);

  useEffect(() => {
    if (step === 'mining') {
      getNodeStatus(); // Trigger the node status query when step is 'mining'
    }
  }, [step, getNodeStatus]);

  useEffect(() => {
    if (!nodeStatusData) return;
    
    // Add proper null checks for each level of the object
    const Node = nodeStatusData.Node;
    if (!Node) return;
    
    const stats = Node.stats;
    if (!stats) return;
    
    const result = stats.result;
    if (!result) return;
    
    const statsData = result.stats;
    if (!statsData) return;
    
    const blockchainInfo = statsData.blockchainInfo;
    if (!blockchainInfo) return;
    
    const { blocks: blocksCount, headers: blockHeader } = blockchainInfo;
    
    if (blockHeader && blockHeader === blocksCount) {
      setIsNodeSynced(true); // Set sync status based on query result
    }
  }, [nodeStatusData]);

  const handleChangePool = (e) => {
    const preset = presetPools[e.target.value];
    if (preset && preset.id !== 'custom') setPoolUrl(preset.url);
    setPool(preset);
  };

  const handleSetupPool = async (e) => {
    e.preventDefault();

    setPoolError(null);
    if (!poolUsername || !poolPassword || !poolUrl)
      return setPoolError('All fields are required');
    if (!poolUrl.match(/stratum\+tcp:\/\/(.*):?\d*$/))
      return setPoolError('Invalid pool URL');

    // Only mark as complete if token is available (setup and signin completed)
    if (!token) {
      setPoolError('Please wait for authentication to complete');
      return;
    }

    setPool({
      ...pool,
      username: poolUsername,
      password: poolPassword,
      url: poolUrl,
    });

    setIsComplete(true);
    setStep(4);
  };

  const handlesSetupSoloMining = async (e) => {
    e.preventDefault();
    try {
      setPoolError(null);
      if (!poolUsername) return setPoolError('All fields are required');

      if (!isValidBitcoinAddress(poolUsername))
        return setPoolError('Please add a valid Bitcoin address');

      // Only mark as complete if token is available (setup and signin completed)
      if (!token) {
        setPoolError('Please wait for authentication to complete');
        return;
      }

      const soloUrl = 'stratum+tcp://127.0.0.1:3333';
      const soloPassword = 'x';

      setPoolUrl(soloUrl);
      setPoolPassword(soloPassword);

      setPool({
        username: poolUsername,
        password: soloPassword,
        url: soloUrl,
        index: 1,
      });

      setSoloMining(true);
      setIsComplete(true);
      setStep(4);
    } catch (error) {
      setError(error.toString());
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();

    if (!password || !verifyPassword) {
      setError(intl.formatMessage({ id: 'setup.password.required' }));
      return;
    }

    if (password.length < 8) {
      setError(intl.formatMessage({ id: 'setup.password.too_short' }));
      return;
    }

    if (password !== verifyPassword) {
      setError(intl.formatMessage({ id: 'setup.password.mismatch' }));
      return;
    }

    setError(null); // Clear previous errors

    try {
      // Wait for saveSetup to complete
      const saveSetupResult = await saveSetup({ variables: { input: { password } } });
      
      // Check for errors in saveSetup
      if (saveSetupResult?.data?.Auth?.setup?.error) {
        setError(saveSetupResult.data.Auth.setup.error.message);
        return;
      }

      // Wait for signin to complete
      const signinResult = await signin({ variables: { input: { password } } });
      
      // Check for errors in signin
      if (signinResult?.data?.Auth?.login?.error) {
        setError(signinResult.data.Auth.login.error.message);
        return;
      }

      // Only proceed to next step if both operations succeeded
      // Token will be set by the useEffect when dataSignin is available
      // For solo-node, skip mining type step and go directly to wallet
      if (isSoloNode) {
        setStep('wallet');
      } else {
        setStep('mining');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during setup');
    }
  };

  const handleStartMining = () => {
    restartMiner();
    router.reload();
  };

  return (
    <>
      <Head>
        <title>Setup your Apollo miner</title>
      </Head>

      {step === 1 && <StepWelcome setStep={setStep} />}

      {step === 2 && (
        <StepPassword
          password={password}
          setPassword={setPassword}
          verifyPassword={verifyPassword}
          setVerifyPassword={setVerifyPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          setError={setError}
          handlePassword={handlePassword}
          setStep={setStep}
        />
      )}

      {step === 'mining' && !isSoloNode && (
        <StepMiningType
          setStep={setStep}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          isNodeSynced={isNodeSynced} // Passing sync status to StepMiningType
        />
      )}

      {step === 'wallet' && (
        <StepWallet
          poolUsername={poolUsername}
          setPoolUsername={setPoolUsername}
          poolError={poolError}
          setPoolError={setPoolError}
          handlesSetupSoloMining={handlesSetupSoloMining}
          error={error}
          setStep={setStep}
          isSoloNode={isSoloNode}
        />
      )}

      {step === 3 && !isSoloNode && (
        <StepPool
          pool={pool}
          setPool={setPool}
          poolUrl={poolUrl}
          setPoolUrl={setPoolUrl}
          poolUsername={poolUsername}
          setPoolUsername={setPoolUsername}
          poolPassword={poolPassword}
          setPoolPassword={setPoolPassword}
          poolError={poolError}
          setPoolError={setPoolError}
          handleSetupPool={handleSetupPool}
          handleChangePool={handleChangePool}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          setStep={setStep}
        />
      )}

      {step === 4 && (
        <StepComplete
          handleStartMining={handleStartMining}
          loadingMinerRestart={loadingMinerRestart}
          isSoloNode={isSoloNode}
        />
      )}
    </>
  );
};

export default Setup;
