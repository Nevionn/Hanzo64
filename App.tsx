import React, {useEffect} from 'react';
import Navigator from './src/navigation/Navigator';
import {bootstrapApp} from './src/app/bootstrap';
import {logAllTables, logDatabaseTables} from './src/hooks/useBdHelper';
// import {dropPinCodeTable} from './src/hooks/usePinCodeRequest';

const App = () => {
  useEffect(() => {
    bootstrapApp();
  }, []);

  logAllTables();
  // logDatabaseTables();
  // dropPinCodeTable();

  return (
    <>
      <Navigator />
    </>
  );
};

export default App;
