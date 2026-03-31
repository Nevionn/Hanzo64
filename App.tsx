import React, {useEffect} from 'react';
import Navigator from './src/navigation/Navigator';
import {bootstrapApp} from './src/app/bootstrap';
import {logAllTables, logDatabaseTables} from './src/hooks/useBdHelper';

const App = () => {
  useEffect(() => {
    bootstrapApp();
  }, []);

  // logAllTables();
  // logDatabaseTables();

  return (
    <>
      <Navigator />
    </>
  );
};

export default App;
