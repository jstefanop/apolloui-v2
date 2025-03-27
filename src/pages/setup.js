import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLazyQuery } from '@apollo/client';
import { useColorModeValue, useDisclosure } from '@chakra-ui/react';

import { MINER_RESTART_QUERY } from '../graphql/miner';
import { AUTH_LOGIN_QUERY, SAVE_SETUP_QUERY } from '../graphql/auth';
import { SET_POOLS_QUERY } from '../graphql/pools';
import { SET_SETTINGS_QUERY } from '../graphql/settings';
import { NODE_STATS_QUERY } from '../graphql/node';
import { isValidBitcoinAddress, presetPools } from '../lib/utils';

// Components
import StepWelcome from '../components/setup/StepWelcome';
import StepMiningType from '../components/setup/StepMiningType';
import StepWallet from '../components/setup/StepWallet';
import StepPool from '../components/setup/StepPool';
import StepPassword from '../components/setup/StepPassword';
import StepComplete from '../components/setup/StepComplete';

const Setup = () => {
  const router = useRouter();
  const textColor = useColorModeValue('brand.800', 'white');

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

  const [saveSetup, { data: dataSaveSetup, error: errorSaveSetup }] =
    useLazyQuery(SAVE_SETUP_QUERY, { fetchPolicy: 'no-cache' });

  const [signin, { data: dataSignin, error: errorSignin }] = useLazyQuery(
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

    if (dataSignin?.Auth?.login?.result)
      setToken(dataSignin.Auth.login.result.accessToken);
  }, [dataSaveSetup, dataSignin, errorSignin, errorSaveSetup]);

  useEffect(() => {
    if (!isComplete) return;

    localStorage.setItem('token', token);

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
    const {
      Node: {
        stats: {
          result: {
            stats: {
              blockchainInfo: { blocks: blocksCount, headers: blockHeader },
            },
          },
        },
      },
    } = nodeStatusData || {};
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
      setError('All fields are required');
      return;
    }

    if (password !== verifyPassword) {
      setError('Passwords do not match');
      return;
    }

    await saveSetup({ variables: { input: { password } } });

    await signin({ variables: { input: { password } } });

    setStep('mining');
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
          handlePassword={handlePassword}
          setStep={setStep}
        />
      )}

      {step === 'mining' && (
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
        />
      )}

      {step === 3 && (
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
        />
      )}
    </>
  );
};

export default Setup;
