import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export const usePasswordSettings = () => {
  const { settings, setSettings, setErrorForm, setIsChanged } = useSettings();

  // Stato locale delle password
  const [lockPassword, setLockPassword] = useState('');
  const [verifyLockpassword, setVerifyLockPassword] = useState('');
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [isLockpasswordError, setIsLockpasswordError] = useState(false);

  // Validazione password
  useEffect(() => {
    if (!lockPassword || !verifyLockpassword) {
      setIsLockpasswordError(false);
      setIsChanged(false);
    } else if (lockPassword.length < 8) {
      setIsLockpasswordError('The password must have 8 characters at least');
      setIsChanged(false);
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
      setIsLockpasswordError('Passwords must match');
      setIsChanged(false);
    }
  }, [lockPassword, verifyLockpassword, setSettings, setIsChanged]);

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