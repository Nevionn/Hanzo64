import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS SettingsTable (id INTEGER PRIMARY KEY AUTOINCREMENT, darkMode INTEGER default 1, sortOrder TEXT default newest)',
    [],
    (tx, results) => {
      console.log('Таблица настроек создана');
    },
  );
});

const useAcceptSettings = () => {
  return newSettings => {
    db.transaction(tx => {
      // Сначала проверяем, существует ли уже запись с настройками
      tx.executeSql(
        'SELECT * FROM SettingsTable LIMIT 1',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            // Если запись найдена, обновляем её
            tx.executeSql(
              'UPDATE SettingsTable SET darkMode = ?, sortOrder = ? WHERE id = ?',
              [
                newSettings.darkMode ? 1 : 0,
                newSettings.sortOrder,
                results.rows.item(0).id,
              ],
              () => {
                console.log('Настройки обновлены:', newSettings);
              },
              error => {
                console.error('Ошибка при обновлении настроек:', error);
              },
            );
          } else {
            // Если записи нет, создаем новую
            tx.executeSql(
              'INSERT INTO SettingsTable (darkMode, sortOrder) VALUES (?, ?)',
              [newSettings.darkMode ? 1 : 0, newSettings.sortOrder],
              () => {
                console.log('Настройки сохранены:', newSettings);
              },
              error => {
                console.error('Ошибка при сохранении настроек:', error);
              },
            );
          }
        },
        error => {
          console.error(
            'Ошибка при проверке существования записи настроек:',
            error,
          );
        },
      );
    });
  };
};

const useGetSettings = () => {
  return setSettings => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SettingsTable LIMIT 1',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            const settingsObject = {
              darkMode: !!row.darkMode,
              sortOrder: row.sortOrder || 'newest',
            };
            setSettings(settingsObject);
          }
        },
        error => {
          console.error('Ошибка при получении объекта настроек:', error);
        },
      );
    });
  };
};

const useGetColorTheme = () => {
  return setColor => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SettingsTable LIMIT 1',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            const darkMode = !!row.darkMode; // Преобразуем в boolean
            setColor(darkMode);
            console.log(darkMode);
          } else {
            setColor(false);
          }
        },
        error => {
          console.error('Ошибка при получении темы:', error);
        },
      );
    });
  };
};

const useShowSettings = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SettingsTable',
        [],
        (tx, result) => {
          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              console.log('Row:', row);
            }
          } else {
            console.log('таблица настроек пустая');
          }
        },
        error => {
          console.log('Error fetching table content:', error);
        },
      );
    });
  };
};

export function useSettingsRequest() {
  const acceptSettings = useAcceptSettings();
  const getSettings = useGetSettings();
  const getColorTheme = useGetColorTheme();
  const showSettings = useShowSettings();
  return {
    acceptSettings,
    getSettings,
    getColorTheme,
    showSettings,
  };
}
