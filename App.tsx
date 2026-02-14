import React, {useEffect} from 'react';
import Navigator from './src/navigation/Navigator';
import {AppSettingsProvider} from './src/utils/settingsContext';
import {bootstrapApp} from './src/app/bootstrap';
import {logAllTables} from './src/hooks/useBdHelper';

const App = () => {
  useEffect(() => {
    bootstrapApp();
  }, []);

  logAllTables();

  return (
    <>
      <AppSettingsProvider>
        <Navigator />
      </AppSettingsProvider>
    </>
  );
};

export default App;
