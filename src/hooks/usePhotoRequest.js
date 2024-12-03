import SQLite from 'react-native-sqlite-storage';
const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

db.transaction(tx => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS PhotosTable (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          album_id INTEGER, 
          title TEXT, 
          photo BLOB, 
          created_at TEXT, 
          FOREIGN KEY (album_id) REFERENCES AlbumsTable (id)
        )`,
    [],
    (tx, results) => {
      console.log('Таблица фотографий создана');
    },
    error => {
      console.error('Ошибка при создании таблицы:', error);
    },
  );
});

const useAddPhotoInAlbum = () => {
  return photoData => {
    db.transaction(tx => {
      // Добавление фотографии
      tx.executeSql(
        'INSERT INTO PhotosTable (album_id, title, photo, created_at) VALUES (?, ?, ?, ?)',
        [
          photoData.album_id,
          photoData.title,
          photoData.photo,
          photoData.created_at,
        ],
        (_, results) => {
          console.log('Фотография успешно добавлена в альбом.');
          // После успешного добавления обновляем счётчик фотографий
          tx.executeSql(
            'UPDATE AlbumsTable SET countPhoto = countPhoto + 1 WHERE id = ?',
            [photoData.album_id],
            (_, updateResults) => {
              console.log('Счётчик фотографий успешно обновлён.');
            },
            error => {
              console.error(
                'Ошибка при обновлении счётчика фотографий:',
                error,
              );
            },
          );
        },
        error => {
          console.error('Ошибка при добавлении фотографии:', error);
        },
      );
    });
  };
};

const useGetPhotoFromAlbum = () => {
  return (albumId, setPhotos) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PhotosTable WHERE album_id = ?', // Запрос всех фотографий по ID альбома
        [albumId],
        (tx, results) => {
          const photos = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);

            photos.push({
              id: row.id,
              album_id: row.album_id,
              title: row.title,
              photo: row.photo,
              created_at: row.created_at,
            });
          }
          setPhotos(photos); // Обновляем состояние
        },
        error => {
          console.error('Ошибка при получении фотографий:', error);
        },
      );
    });
  };
};

const useDeleteAllPhotos = () => {
  return albumId => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM PhotosTable WHERE album_id = ?',
        [albumId],
        (_, results) => {
          console.log(`Фотографии из альбома с ID ${albumId} успешно удалены.`);
        },
        error => {
          console.error('Ошибка при удалении фотографий:', error);
        },
      );
    });
  };
};

const useDeletePhoto = () => {
  return (albumId, photoId) => {
    db.transaction(tx => {
      // Удаление фотографии
      tx.executeSql(
        'DELETE FROM PhotosTable WHERE album_id = ? AND id = ?',
        [albumId, photoId],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(
              `Фотография с ID ${photoId} из альбома с ID ${albumId} успешно удалена.`,
            );
            // После успешного удаления обновляем счётчик фотографий
            tx.executeSql(
              'UPDATE AlbumsTable SET countPhoto = countPhoto - 1 WHERE id = ? AND countPhoto > 0',
              [albumId],
              (_, updateResults) => {
                console.log('Счётчик фотографий успешно обновлён.');
              },
              error => {
                console.error(
                  'Ошибка при обновлении счётчика фотографий:',
                  error,
                );
              },
            );
          } else {
            console.log('Фотография не найдена.');
          }
        },
        error => {
          console.error('Ошибка при удалении фотографии:', error);
        },
      );
    });
  };
};

const useClearTable = () => {
  return tableName => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS ${tableName}`,
        [],
        (tx, result) => {
          console.log('Table deleted successfully');
        },
        error => {
          console.log('Error deleting table:', error);
        },
      );
    });
  };
};

// Функция для получения информации о таблице
const useShowPhotos = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PhotosTable', // Запрос всех записей из таблицы PhotosTable
        [],
        (tx, result) => {
          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              console.log('Row:', row); // Выводим все данные для каждой строки
            }
          } else {
            console.log('Таблица фотографий пустая');
          }
        },
        error => {
          console.log('Ошибка при получении данных из таблицы:', error);
        },
      );
    });
  };
};

export const useShowShemePhotoTable = () => {
  return tableName => {
    db.transaction(tx => {
      tx.executeSql(
        `PRAGMA table_info(${tableName})`,
        [],
        (tx, result) => {
          const rows = result.rows;
          for (let i = 0; i < rows.length; i++) {
            const column = rows.item(i);
            console.log(column.name, column.type);
          }
        },
        error => {
          console.log('Error getting table schema:', error);
        },
      );
    });
  };
};

export function usePhotoRequest() {
  const addPhoto = useAddPhotoInAlbum();
  const getPhoto = useGetPhotoFromAlbum();
  const deleteAllPhotos = useDeleteAllPhotos();
  const deletePhoto = useDeletePhoto();
  const dropTable = useClearTable();
  const pidoras = useShowPhotos();
  const showSheme = useShowShemePhotoTable();
  return {
    addPhoto,
    getPhoto,
    deleteAllPhotos,
    deletePhoto,
    dropTable,
    pidoras,
    showSheme,
  };
}
