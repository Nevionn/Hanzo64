import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {name: 'database.db', location: 'default'},
  () => console.log('База данных открыта'),
  err => console.log('Ошибка открытия базы:', err),
);

/**
 * Вспомогательный метод для просмотра таблиц
 * Вызов в App.tsx
 */

export const logAllTables = () => {
  const tables = ['AlbumsTable', 'PhotosTable', 'PinCodeTable', 'settings'];

  db.transaction(tx => {
    tables.forEach(table => {
      tx.executeSql(
        `PRAGMA table_info(${table});`,
        [],
        (_, result) => {
          console.log(`\n=== Схема таблицы ${table} ===`);
          for (let i = 0; i < result.rows.length; i++) {
            console.log(result.rows.item(i));
          }
        },
        (_, error) => {
          console.log(`Ошибка при получении схемы таблицы ${table}:`, error);
          return true;
        },
      );

      tx.executeSql(
        `SELECT * FROM ${table};`,
        [],
        (_, result) => {
          console.log(`\n=== Содержимое таблицы ${table} ===`);
          if (result.rows.length === 0) {
            console.log('Таблица пуста');
          } else {
            for (let i = 0; i < result.rows.length; i++) {
              console.log(result.rows.item(i));
            }
          }
        },
        (_, error) => {
          console.log(`Ошибка при получении данных таблицы ${table}:`, error);
          return true;
        },
      );
    });
  });
};
