import {create} from 'zustand';
import {AppSettings} from './settings.types';
import {defaultSettings} from './settings.defaults';
import {settingsStorage} from '../../storage/settings/settingsStorage';

/**
 * Состояние zustand-стора настроек приложения.
 */

interface SettingsState {
  settings: AppSettings;
  isHydrated: boolean;

  /**
   * Инициализация стора.
   * Получение данных из бд и запись в стор.
   */

  init: () => Promise<void>;
  setSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
}

/**
 * Глобальный zustand-store настроек приложения.
 *
 * Является единственным источником правды для UI.
 */

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isHydrated: false,

  init: async () => {
    const stored = await settingsStorage.load();
    if (stored) set({settings: stored});
    set({isHydrated: true});
  },

  setSetting: (key, value) => {
    set(state => ({
      settings: {...state.settings, [key]: value},
    }));

    settingsStorage.save({
      ...get().settings,
      [key]: value,
    });
  },
}));
