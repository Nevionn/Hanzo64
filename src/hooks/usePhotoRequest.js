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
      // Добавление новой фотографии
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

          // Обновление счётчика фотографий
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

          // Проверяем установлена ли фотография в качестве обложки в ручную
          tx.executeSql(
            'SELECT manualCoverMode FROM AlbumsTable WHERE id = ?',
            [photoData.album_id],
            (_, selectResults) => {
              const manualCoverMode =
                selectResults.rows.item(0)?.manualCoverMode;

              if (!manualCoverMode) {
                // Устанавливаем текущую фотографию как обложку
                tx.executeSql(
                  'UPDATE AlbumsTable SET coverPhoto = ? WHERE id = ?',
                  [photoData.photo, photoData.album_id],
                  () => {
                    console.log(
                      'Обложка альбома обновлена на последнюю добавленную фотографию.',
                    );
                  },
                  error => {
                    console.error(
                      'Ошибка при обновлении обложки альбома:',
                      error,
                    );
                  },
                );
              } else {
                console.log(
                  'Обложка не обновлена, так как включён ручной режим.',
                );
              }
            },
            error => {
              console.error(
                'Ошибка при проверке режима установки обложки:',
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
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM PhotosTable',
        [],
        (_, results) => {
          console.log(`Все фотографии, всех альбомов успешно удалены.`);
        },
        error => {
          console.error('Ошибка при удалении фотографий:', error);
        },
      );
    });
  };
};

const useDeleteAllPhotosCurrentAlbum = () => {
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

            // Обновляем счётчик фотографий
            tx.executeSql(
              'UPDATE AlbumsTable SET countPhoto = countPhoto - 1 WHERE id = ? AND countPhoto > 0',
              [albumId],
              (_, updateResults) => {
                console.log('Счётчик фотографий успешно обновлён.');

                // Проверяем количество оставшихся фотографий в альбоме
                tx.executeSql(
                  'SELECT COUNT(*) as photoCount FROM PhotosTable WHERE album_id = ?',
                  [albumId],
                  (_, countResults) => {
                    const photoCount = countResults.rows.item(0)?.photoCount;

                    if (photoCount === 0) {
                      // Если фотографий больше нет, обнуляем обложку и сбрасываем manualCoverMode
                      tx.executeSql(
                        'UPDATE AlbumsTable SET coverPhoto = NULL, manualCoverMode = 0 WHERE id = ?',
                        [albumId],
                        () => {
                          console.log(
                            'Обложка альбома удалена, manualCoverMode сброшен в 0.',
                          );
                        },
                        error => {
                          console.error(
                            'Ошибка при обнулении обложки и сбросе manualCoverMode:',
                            error,
                          );
                        },
                      );
                    } else {
                      // Если manualCoverMode не активен, обновляем обложку на последнюю оставшуюся фотографию
                      tx.executeSql(
                        'SELECT manualCoverMode FROM AlbumsTable WHERE id = ?',
                        [albumId],
                        (_, selectResults) => {
                          const manualCoverMode =
                            selectResults.rows.item(0)?.manualCoverMode;

                          if (!manualCoverMode) {
                            // Выбираем последнюю фотографию
                            tx.executeSql(
                              'SELECT photo FROM PhotosTable WHERE album_id = ? ORDER BY created_at DESC LIMIT 1',
                              [albumId],
                              (_, photoResults) => {
                                if (photoResults.rows.length > 0) {
                                  const lastPhoto =
                                    photoResults.rows.item(0).photo;

                                  tx.executeSql(
                                    'UPDATE AlbumsTable SET coverPhoto = ? WHERE id = ?',
                                    [lastPhoto, albumId],
                                    () => {
                                      console.log(
                                        'Обложка альбома обновлена на последнюю доступную фотографию.',
                                      );
                                    },
                                    error => {
                                      console.error(
                                        'Ошибка при обновлении обложки альбома:',
                                        error,
                                      );
                                    },
                                  );
                                }
                              },
                              error => {
                                console.error(
                                  'Ошибка при проверке оставшихся фотографий:',
                                  error,
                                );
                              },
                            );
                          } else {
                            console.log(
                              'Ручной режим установлен, обложка не обновляется.',
                            );
                          }
                        },
                        error => {
                          console.error(
                            'Ошибка при проверке режима установки обложки:',
                            error,
                          );
                        },
                      );
                    }
                  },
                  error => {
                    console.error(
                      'Ошибка при проверке количества оставшихся фотографий:',
                      error,
                    );
                  },
                );
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

const useShowPhotos = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PhotosTable',
        [],
        (tx, result) => {
          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              console.log('Row:', row);
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

export function usePhotoRequest() {
  const addPhoto = useAddPhotoInAlbum();
  const getPhoto = useGetPhotoFromAlbum();
  const deleteAllPhotos = useDeleteAllPhotos();
  const deleteAllPhotosCurrentAlbum = useDeleteAllPhotosCurrentAlbum();
  const deletePhoto = useDeletePhoto();
  const dropTable = useClearTable();
  const showTable = useShowPhotos();
  return {
    addPhoto,
    getPhoto,
    deleteAllPhotos,
    deleteAllPhotosCurrentAlbum,
    deletePhoto,
    dropTable,
    showTable,
  };
}
