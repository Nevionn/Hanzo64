import React, {useEffect} from 'react';
import Navigator from './src/navigation/Navigator';
import {bootstrapApp} from './src/app/bootstrap';
import {logAllTables} from './src/hooks/useBdHelper';

const App = () => {
  useEffect(() => {
    bootstrapApp();
  }, []);

  logAllTables();

  return (
    <>
      <Navigator />
    </>
  );
};

export default App;
