import React, {createContext, useContext, useState} from 'react';
import {COLOR} from './colorTheme';

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({children}) => {
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    sortOrder: null,
  });

  const saveAppSettings = newSettings => {
    setAppSettings(newSettings);
  };

  return (
    <AppSettingsContext.Provider value={{appSettings, saveAppSettings}}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  return useContext(AppSettingsContext);
};

export const setButtonColor = darkMode => {
  return darkMode ? COLOR.dark.BUTTON_COLOR : COLOR.light.BUTTON_COLOR;
};

export const setButtonTextColor = darkMode => {
  return darkMode ? COLOR.dark.BUTTON_TEXT : COLOR.light.BUTTON_TEXT;
};

export const setButtonTextColorRecommendation = darkMode => {
  return darkMode
    ? COLOR.dark.BUTTON_TEXT_GREEN
    : COLOR.light.BUTTON_TEXT_GREEN;
};

export const setSvgIconColor = darkMode => {
  return darkMode ? COLOR.dark.ICON : COLOR.light.ICON;
};

export const setAlertColor = darkMode => {
  return darkMode ? COLOR.dark.alertColor : COLOR.light.alertColor;
};

export const setStatusBarTheme = darkMode => {
  return darkMode ? 'light-content' : 'dark-content';
};
