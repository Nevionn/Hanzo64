import SQLite from 'react-native-sqlite-storage';
import {AppSettings} from '../../store/settings/settings.types';
import {defaultSettings} from '../../store/settings/settings.defaults';

const DB_NAME = 'database.db';

const db = SQLite.openDatabase(
  {name: DB_NAME, location: 'default'},
  () => console.log('DB opened:', DB_NAME),
  error => console.error('DB open error', error),
);

/**
 * Слой доступа к настройкам приложения в SQLite.
 *
 * Отвечает ТОЛЬКО за:
 * - создание таблицы settings
 * - чтение и запись настроек
 *
 * НЕ содержит бизнес-логики и не знает про UI или zustand.
 */

/**
 * Инициализация таблицы настроек.
 */

export const settingsStorage = {
  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS settings (
              id INTEGER PRIMARY KEY NOT NULL,
              darkMode INTEGER NOT NULL
            );
          `);

          tx.executeSql(
            `INSERT OR IGNORE INTO settings (id, darkMode) VALUES (?, ?)`,
            [1, defaultSettings.darkMode ? 1 : 0],
          );
        },
        error => reject(error),
        () => resolve(),
      );
    });
  },

  /**
   * Загрузка настроек из базы данных.
   *
   * @returns объект настроек приложения
   */

  load(): Promise<AppSettings> {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT darkMode FROM settings WHERE id = 1`,
            [],
            (_, result) => {
              if (result.rows.length === 0) {
                resolve(defaultSettings);
                return;
              }

              resolve({
                darkMode: Boolean(result.rows.item(0).darkMode),
              });
            },
          );
        },
        error => reject(error),
      );
    });
  },

  /**
   * Сохранение настроек в базу данных.
   *
   * @param settings - актуальные настройки приложения
   */

  save(settings: AppSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(`UPDATE settings SET darkMode = ? WHERE id = 1`, [
            settings.darkMode ? 1 : 0,
          ]);
        },
        error => reject(error),
        () => resolve(),
      );
    });
  },
};
