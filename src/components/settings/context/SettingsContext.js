import React, { createContext, useContext } from 'react';

// Define default values for the context
const defaultContextValue = {
  settings: { initial: true },
  setSettings: () => { },
  errorForm: null,
  setErrorForm: () => { },
  isChanged: false,
  setIsChanged: () => { },
  handleBackup: () => { },
  handleRestoreBackup: () => { },
  handleFormatDisk: () => { },
  handleDiscardChanges: () => { },
  handleSaveSettings: () => { },
  setIsModalRestoreOpen: () => { },
  setIsModalFormatOpen: () => { },
  setIsModalConnectOpen: () => { },
};

// Create the context
const SettingsContext = createContext(defaultContextValue);

// Provider component
export const SettingsProvider = ({ children, value }) => {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use the context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};