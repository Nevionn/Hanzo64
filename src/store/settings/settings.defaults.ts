import {AppSettings} from './settings.types';

/**
 * Дефолтные настройки приложения.
 *
 * Используются:
 * - при первом запуске приложения
 * - при отсутствии данных в БД
 * - как initial state для zustand-store
 */

export const defaultSettings: AppSettings = {
  darkMode: true,
};
