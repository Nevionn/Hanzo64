import React, {createContext, useContext, useState} from 'react';
import {COLOR} from '../shared/colorTheme';

const AppSettingsContext = createContext();

// TODO: удалить appSettings и все его зависимости (рудимент)

export const AppSettingsProvider = ({children}) => {
  // Значения по умолчанию
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
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

/**
 * Позволяет в любом компоненте читать настройки и изменять их
 *
 * @example const { appSettings, saveAppSettings } = useAppSettings();
 */

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

export const setArrowAccordionColor = darkMode => {
  return darkMode
    ? {onSurfaceVariant: COLOR.dark.ICON}
    : {onSurfaceVariant: COLOR.light.ICON};
};

export const setAlertColor = darkMode => {
  return darkMode ? COLOR.dark.alertColor : COLOR.light.alertColor;
};

export const setStatusBarTheme = darkMode => {
  return darkMode ? 'light-content' : 'dark-content';
};
