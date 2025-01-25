import {ViewStyle} from 'react-native';

type ThemeColors = {
  MAIN_COLOR: string;
  NAVIBAR_COLOR?: string;
  BUTTON_COLOR: string;
  BUTTON_COLOR_INACTIVE: string;
  BUTTON_TEXT: string;
  BUTTON_TEXT_GREEN: string;
  BUTTON_PIN_COLOR: string;
  TEXT_BRIGHT: string;
  TEXT_DIM: string;
  SECONDARY_COLOR: string;
  ICON: string;
  alertColor: string;
};

type ColorSchema = {
  NAME_APP: string;
  SVG_WHITE: string;
  LOAD: string;
  ZOOMABLE_VIEW_CONTAINER: string;
  INFOBAR_IMG_VIEWER: string;
  dark: ThemeColors;
  light: ThemeColors;
};

export const COLOR: ColorSchema = {
  NAME_APP: '#9d65c9',
  SVG_WHITE: 'white',
  LOAD: '#6AD4E7',
  ZOOMABLE_VIEW_CONTAINER: 'black',
  INFOBAR_IMG_VIEWER: 'black',
  dark: {
    MAIN_COLOR: '#1c1549',

    BUTTON_COLOR: '#6934d1',
    BUTTON_COLOR_INACTIVE: '#7a6a9b',
    BUTTON_TEXT: '#87ECD5',
    BUTTON_TEXT_GREEN: '#87ECD5',
    BUTTON_PIN_COLOR: '#4A90E2',

    TEXT_BRIGHT: 'white',
    TEXT_DIM: '#ACACAC',

    SECONDARY_COLOR: '#2a206c',

    ICON: 'white',
    alertColor: '#EC97A1',
  },
  light: {
    MAIN_COLOR: '#e8e2f0',

    NAVIBAR_COLOR: '#e2cbdb',

    BUTTON_COLOR: '#ababcb',
    BUTTON_COLOR_INACTIVE: '#7a6a9b',
    BUTTON_TEXT: '#1FC29D',
    BUTTON_TEXT_GREEN: '#1FC29D',
    BUTTON_PIN_COLOR: '#4A90E2',

    TEXT_BRIGHT: 'black',
    TEXT_DIM: 'grey',

    SECONDARY_COLOR: '#d3d1e4',

    ICON: '#56465a',

    alertColor: '#981d26',
  },
};

export const borderButtonStyle = (): ViewStyle => ({
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.8,
  shadowRadius: 4,
  borderWidth: 1,
  borderColor: '#292625',
});
