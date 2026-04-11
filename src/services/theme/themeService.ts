import {AppSettings} from '../../store/settings/settings.types';

/**
 * Определяет тему приложения на основе пользовательских настроек.
 *
 * @param settings - текущие настройки приложения
 * @returns строковый идентификатор темы
 */

export const resolveTheme = (settings: AppSettings) => {
  return settings.darkMode ? 'dark' : 'light';
};
