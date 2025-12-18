import React from 'react';
import Navigator from './src/navigation/Navigator';
import {AppSettingsProvider} from './src/utils/settingsContext';

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
