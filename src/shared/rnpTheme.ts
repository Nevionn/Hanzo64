import {MD3LightTheme} from 'react-native-paper';
import {TYPOGRAPHY} from './typography';

/**
 * Переопределение шрифтов у компонентов react-native-paper
 */

export const overrideTheme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,

    // Основной текст (Searchbar, TextInput, Paragraph и т.д.)
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: TYPOGRAPHY.generalFont,
    },

    // Кнопки
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: TYPOGRAPHY.generalFont,
    },

    // Заголовки (title, Appbar и т.д.)
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: TYPOGRAPHY.generalFont,
    },
  },
};
