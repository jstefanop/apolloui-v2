import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useIntl } from 'react-intl';

export const usePasswordSettings = () => {
  const intl = useIntl();
  const { settings, setSettings, setErrorForm, setIsChanged } = useSettings();

  // Stato locale delle password
  const [lockPassword, setLockPassword] = useState('');
  const [verifyLockpassword, setVerifyLockPassword] = useState('');
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [isLockpasswordError, setIsLockpasswordError] = useState(false);

  // A pair that was valid a moment ago must not outlive the edit that made it
  // invalid: left in the settings, it would be saved by the next unrelated change
  // while the form shows an error.
  const dropPair = () =>
    setSettings((prev) => {
      if (prev.lockPassword === undefined && prev.verifyLockpassword === undefined) return prev;
      // eslint-disable-next-line no-unused-vars
      const { lockPassword: _l, verifyLockpassword: _v, ...rest } = prev;
      return rest;
    });

  // Validazione password
  useEffect(() => {
    if (!lockPassword || !verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(false);
      dropPair();
    } else if (lockPassword.length < 8) {
      setIsLockpasswordError(intl.formatMessage({ id: 'settings.sections.system.password.error.required' }));
      setIsChanged(false);
      dropPair();
    } else if (lockPassword === verifyLockpassword) {
      setIsLockpasswordError(false);
      // Aggiorna il contesto globale con i valori validati
      setSettings((prev) => ({
        ...prev,
        lockPassword: lockPassword,
        verifyLockpassword: verifyLockpassword
      }));
      setIsChanged(true);
    } else {
      setIsLockpasswordError(intl.formatMessage({ id: 'settings.sections.system.password.error.match' }));
      setIsChanged(false);
      dropPair();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockPassword, verifyLockpassword, setSettings, setIsChanged, intl]);

  return {
    lockPassword,
    setLockPassword,
    verifyLockpassword,
    setVerifyLockPassword,
    showLockPassword,
    setShowLockPassword,
    isLockpasswordError
  };
};