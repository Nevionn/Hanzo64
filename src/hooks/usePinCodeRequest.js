import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS PinCodeTable (id INTEGER PRIMARY KEY AUTOINCREMENT, pinCode TEXT, isActive INTEGER DEFAULT 0)',
    [],
    (tx, results) => {
      console.log('Table created successfully');
    },
  );
});

const useAddPinCodeToTable = () => {
  return pinCode => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO PinCodeTable (pinCode, isActive) VALUES (?, ?)',
        [pinCode, 1], // Передаем пин-код в качестве параметра
        (_, results) => {
          console.log('пин код успешно добавлен в таблицу.');
        },
        error => {
          console.error('Ошибка при добавлении пин-кода в таблицу:', error);
        },
      );
    });
  };
};

const useGetPinCode = () => {
  return setPinCode => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT pinCode FROM PinCodeTable', // Извлекаем пин-код
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            // Если есть результаты, берем первый пин-код
            const pinCode = results.rows.item(0).pinCode;
            setPinCode(pinCode); // Сохраняем пин-код
          } else {
            setPinCode(''); // Если данных нет, ставим пустую строку
          }
        },
        error => {
          console.log('Error fetching pin code:', error);
          setPinCode(''); // В случае ошибки устанавливаем пустую строку
        },
      );
    });
  };
};

const useCheckActivePinCode = () => {
  return callback => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PinCodeTable WHERE isActive = 1', // Проверяем, есть ли активированный пин-код
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            console.log('Активированный пин-код найден');
            callback(true); // Возвращаем true, если пин-код активирован
          } else {
            console.log('Активированный пин-код не найден');
            callback(false); // Возвращаем false, если активированного пин-кода нет
          }
        },
        error => {
          console.error('Ошибка при проверке пин-кода:', error);
          callback(false);
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

export const useShowTablesBd = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (tx, result) => {
          const tables = [];
          for (let i = 0; i < result.rows.length; i++) {
            tables.push(result.rows.item(i).name);
          }
          console.log('Tables:', tables);
        },
        error => {
          console.log('Error fetching tables:', error);
        },
      );
    });
  };
};

const useShowTableContent = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PinCodeTable',
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

export const useShowShemeTable = () => {
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

export function usePinCodeRequest() {
  const savePinCode = useAddPinCodeToTable();
  const getPinCodefromTable = useGetPinCode();
  const checkActivePinCode = useCheckActivePinCode();
  const dropTable = useClearTable();
  const showTableContent = useShowTableContent();
  const showTables = useShowTablesBd();
  const showScheme = useShowShemeTable();

  return {
    savePinCode,
    getPinCodefromTable,
    checkActivePinCode,
    dropTable,
    showTables,
    showTableContent,
    showScheme,
  };
}
