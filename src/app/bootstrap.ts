import {settingsStorage} from '../storage/settings/settingsStorage';
import {useSettingsStore} from '../store/settings/useSettingsStore';

/**
 * Начальная инициализация приложения.
 *
 * Вызывается один раз при старте приложения ДО первого рендера UI.
 *
 * Отвечает за:
 * - инициализацию слоя хранения (SQLite)
 * - гидратацию zustand-стора из базы данных
 *
 * Гарантирует, что глобальные настройки
 * будут загружены и доступны для UI.
 */

export const bootstrapApp = async () => {
  console.log('bootstrapApp START');
  await settingsStorage.init();
  await useSettingsStore.getState().init();
};
