import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS AlbumsTable (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, countPhoto INTEGER, created_at TEXT)',
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
            albumsList.push(results.rows.item(i));
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

const useShowAlbums = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM AlbumsTable',
        [],
        (tx, result) => {
          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              console.log('Row:', row);
            }
          } else {
            console.log('Table is empty');
          }
        },
        error => {
          console.log('Error fetching table content:', error);
        },
      );
    });
  };
};

export const useShowShemeAlbumsTable = () => {
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

export function useAlbumsRequest() {
  const addAlbum = useAddNewAlbumToTable();
  const showAlbums = useShowAlbums();
  const deleteAllAlbums = useDeleteAllAlbums();
  const showShemeAlbumsTable = useShowShemeAlbumsTable();
  const getAllAlbums = useGetAllAlbums();

  return {
    addAlbum,
    showAlbums,
    deleteAllAlbums,
    showShemeAlbumsTable,
    getAllAlbums,
  };
}
