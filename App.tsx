import React from 'react';
import Navigator from './src/navigation/Navigator';
import {AppSettingsProvider} from './assets/settingsContext';

export const APP_VERSION = '1.0.0';
const App = () => {
  return (
    <>
      <AppSettingsProvider>
        <Navigator />
      </AppSettingsProvider>
    </>
  );
};

export default App;
