import SQLite from 'react-native-sqlite-storage';

/**
 * Хранилище альбомов (SQLite)
 *
 * Отвечает за:
 * - инициализацию таблицы AlbumsTable
 * - добавление новых альбомов (в начало списка)
 * - сохранение порядка альбомов после Drag & Drop
 * - получение списка альбомов в сохранённом порядке
 * - переименование альбома
 * - установку обложки альбома
 * - удаление альбомов
 *
 * Закомментированные логи в DEV режиме могут бить по производительности. При необходимости раскомментировать
 */

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

const initAlbumsTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `
      CREATE TABLE IF NOT EXISTS AlbumsTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        countPhoto INTEGER,
        created_at TEXT,
        coverPhoto TEXT,
        manualCoverMode INTEGER DEFAULT 0,
        sortOrder INTEGER
      )
      `,
      [],
      () => {
        console.log('Таблица альбомов создана');
      },
      error => {
        console.error('❌ Ошибка при создании таблицы AlbumsTable', error);
      },
    );
  });

  ensureColumn('sortOrder', 'INTEGER');
  ensureColumn('description', 'TEXT');
};

/**
 * Метод для миграции.
 * Если приложение обновилось со старой схемы БД —
 * колонка будет добавлена без потери данных.
 */

const ensureColumn = (columnName, columnType) => {
  db.transaction(tx => {
    tx.executeSql('PRAGMA table_info(AlbumsTable)', [], (_, result) => {
      const hasColumn = Array.from({length: result.rows.length}, (_, i) =>
        result.rows.item(i),
      ).some(col => col.name === columnName);

      if (!hasColumn) {
        tx.executeSql(
          `ALTER TABLE AlbumsTable ADD COLUMN ${columnName} ${columnType}`,
        );
      }
    });
  });
};

initAlbumsTable();

/**
 * Добавление нового альбома.
 *
 * Логика:
 * 1. Все существующие альбомы сдвигаются вниз (sortOrder + 1)
 * 2. Новый альбом вставляется с sortOrder = 0 (всегда появляется первым)
 *
 */

const useAddNewAlbumToTable = () => {
  return newAlbum => {
    db.transaction(
      tx => {
        console.log('Новый альбом добавлен в начало');

        // сдвигаем все существующие альбомы вниз
        tx.executeSql(
          'UPDATE AlbumsTable SET sortOrder = sortOrder + 1',
          [],
          (_, res) => {
            console.log(
              `сдвиг альбомов вниз: rowsAffected=${res.rowsAffected}`,
            );
          },
          error => {
            console.error('❌ Failed to shift sortOrder', error);
          },
        );

        // вставляем новый альбом с sortOrder = 0
        tx.executeSql(
          `
          INSERT INTO AlbumsTable
            (title, description, countPhoto, created_at, sortOrder)
          VALUES (?, ?, ?, ?, 0)
          `,
          [
            newAlbum.title,
            newAlbum.description,
            newAlbum.countPhoto,
            newAlbum.created_at,
          ],
          (_, res) => {
            console.log(`✅ Альбом "${newAlbum.title}" добавлен с sortOrder=0`);
          },
          error => {
            console.error('❌ INSERT album failed', error);
          },
        );
      },
      error => {
        console.error('❌ addAlbum transaction error', error);
      },
    );
  };
};

/**
 * Сохранение порядка альбомов после Drag & Drop.
 *
 * @param {Array<{id: number}>} albums
 * Массив альбомов в новом порядке (индекс = sortOrder)
 */

const useSaveAlbumsOrder = () => {
  return albums => {
    // console.log(
    //   '💾 saveAlbumsOrder:',
    //   albums.map(a => a.id),
    // );

    db.transaction(
      tx => {
        albums.forEach((album, index) => {
          // console.log(`↳ id=${album.id}, sortOrder=${index}`);

          tx.executeSql(
            'UPDATE AlbumsTable SET sortOrder = ? WHERE id = ?',
            [index, album.id],
            (_, res) => {
              if (res.rowsAffected !== 1) {
                console.warn(
                  `⚠️ rowsAffected=${res.rowsAffected} for album id=${album.id}`,
                );
              }
            },
            error => {
              console.error(`❌ UPDATE failed for album id=${album.id}`, error);
            },
          );
        });
      },
      error => {
        console.error('❌ saveAlbumsOrder transaction error', error);
      },
      () => {
        console.log('saveAlbumsOrder обновлен');
      },
    );
  };
};

/**
 * Получение всех альбомов в сохранённом порядке.
 *
 * @param {Function} setAlbums
 */

const useGetAllAlbums = () => {
  return setAlbums => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM AlbumsTable ORDER BY sortOrder ASC',
        [],
        (_, results) => {
          const list = [];
          for (let i = 0; i < results.rows.length; i++) {
            list.push(results.rows.item(i));
          }

          // console.log(
          //   '📦 Альбомы получены:',
          //   list.map(a => ({
          //     id: a.id,
          //     sortOrder: a.sortOrder,
          //   })),
          // );

          setAlbums(list);
        },
        error => {
          console.error('❌ Ошибка при получении альбомов', error);
        },
      );
    });
  };
};

/**
 * Получение количества альбомов.
 */

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

/**
 * Переименование альбома.
 */

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

/**
 * Установка обложки альбома вручную.
 * Активирует manualCoverMode = 1.
 * В положение 0, альбом сам проставляет последнюю, добавленную фотографию в качестве обложки.
 */

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

/**
 * Удаление всех альбомов.
 */

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

/**
 * Удаление одного альбома по id.
 */

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
  const saveAlbumsOrder = useSaveAlbumsOrder();
  const getCountAlbums = useGetCountAlbums();
  const renameAlbum = useRenameAlbum();
  const setAlbumCover = useSetAlbumCover();
  const deleteAllAlbums = useDeleteAllAlbums();
  const deleteAlbum = useDeleteAlbum();

  return {
    addAlbum,
    getAllAlbums,
    saveAlbumsOrder,
    getCountAlbums,
    renameAlbum,
    setAlbumCover,
    deleteAllAlbums,
    deleteAlbum,
  };
}
