import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});
db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS AlbumsTable (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, countPhoto INTEGER, created_at TEXT, coverPhoto TEXT, manualCoverMode INTEGER DEFAULT 0)',
    [],
    (tx, results) => {
      console.log('Таблица альбомов создана');
    },
  );
});

const useAddNewAlbumToTable = () => {
  return newAlbum => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO AlbumsTable (title, countPhoto, created_at) VALUES (?, ?, ?)',
        [newAlbum.title, newAlbum.countPhoto, newAlbum.created_at],
        (_, results) => {
          console.log('Альбом успешно добавлен в таблицу.');
        },
        error => {
          console.error('Ошибка при выполнении SQL-запроса:', error);
        },
      );
    });
  };
};

const useGetAllAlbums = () => {
  return (setAlbums, orderState) => {
    // Определяем порядок сортировки и столбец
    let sortColumn = 'created_at';
    let sortOrder = 'DESC';

    if (orderState === 'oldest') {
      sortOrder = 'DESC';
    } else if (orderState === 'newest') {
      sortOrder = 'ASC';
    } else {
      sortColumn = 'title';
      sortOrder = 'ASC';
    }

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM AlbumsTable ORDER BY ${sortColumn} ${sortOrder}`,
        [],
        (tx, results) => {
          const albumsList = [];
          for (let i = 0; i < results.rows.length; i++) {
            albumsList.unshift(results.rows.item(i));
          }
          setAlbums(albumsList);
        },
        error => {
          console.error('Ошибка при получении альбомов:', error);
        },
      );
    });
  };
};

const useGetCountAlbums = () => {
  return () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) AS count FROM AlbumsTable',
          [],
          (tx, result) => {
            const albumsCount = result.rows.item(0).count;
            console.log('Количество альбомов:', albumsCount);
            resolve(albumsCount);
          },
          error => {
            console.log('Ошибка при получении данных из таблицы:', error);
            reject(error);
          },
        );
      });
    });
  };
};

const useRenameAlbum = () => {
  return (id, newTitle) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE AlbumsTable SET title = ? WHERE id = ?',
        [newTitle, id],
        (_, results) => {
          console.log(`Альбом с id ${id} переименован в "${newTitle}".`);
        },
        error => {
          console.error('Ошибка при изменении названия альбома:', error);
        },
      );
    });
  };
};

const useSetAlbumCover = () => {
  return (albumId, photoId) => {
    db.transaction(tx => {
      // Получение данных фотографии, которую нужно установить как обложку
      tx.executeSql(
        'SELECT photo FROM PhotosTable WHERE album_id = ? AND id = ?',
        [albumId, photoId],
        (_, selectResults) => {
          if (selectResults.rows.length > 0) {
            const selectedPhoto = selectResults.rows.item(0).photo;

            // Установка выбранной фотографии как обложки и активация ручного режима
            tx.executeSql(
              'UPDATE AlbumsTable SET coverPhoto = ?, manualCoverMode = 1 WHERE id = ?',
              [selectedPhoto, albumId],
              () => {
                console.log(
                  `Фотография с ID ${photoId} установлена в качестве обложки альбома с ID ${albumId}.`,
                );
              },
              error => {
                console.error(
                  'Ошибка при установке выбранной фотографии как обложки:',
                  error,
                );
              },
            );
          } else {
            console.log(
              `Фотография с ID ${photoId} в альбоме с ID ${albumId} не найдена.`,
            );
          }
        },
        error => {
          console.error(
            'Ошибка при получении данных фотографии для установки обложки:',
            error,
          );
        },
      );
    });
  };
};

const useDeleteAllAlbums = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM AlbumsTable',
        [],
        (_, results) => {
          console.log('Все альбомы удалены из таблицы.');
        },
        error => {
          console.error('Ошибка при удалении всех альбомов:', error);
        },
      );
    });
  };
};

const useDeleteAlbum = () => {
  return id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM AlbumsTable WHERE id = ?',
        [id],
        (_, results) => {
          console.log(`Альбом с id ${id} удален из таблицы.`);
        },
        error => {
          console.error('Ошибка при удалении альбома:', error);
        },
      );
    });
  };
};
export function useAlbumsRequest() {
  const addAlbum = useAddNewAlbumToTable();
  const getAllAlbums = useGetAllAlbums();
  const getCountAlbums = useGetCountAlbums();
  const renameAlbum = useRenameAlbum();
  const setAlbumCover = useSetAlbumCover();
  const deleteAllAlbums = useDeleteAllAlbums();
  const deleteAlbum = useDeleteAlbum();

  return {
    addAlbum,
    getAllAlbums,
    getCountAlbums,
    renameAlbum,
    setAlbumCover,
    deleteAllAlbums,
    deleteAlbum,
  };
}
