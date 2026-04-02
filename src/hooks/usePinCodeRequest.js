import SQLite from 'react-native-sqlite-storage';
import CryptoJS from 'crypto-js';

const db = SQLite.openDatabase({name: 'database.db', location: 'default'});

db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS PinCodeTable (id INTEGER PRIMARY KEY AUTOINCREMENT, pinCode TEXT, isActive INTEGER DEFAULT 0, isSkip INTEGER DEFAULT 0)',
    [],
    (tx, results) => {
      console.log('Таблица пин кода создана');
    },
  );
});

const useAddPinCodeToTable = () => {
  return pinCode => {
    const hashedPin = CryptoJS.SHA256(pinCode).toString(CryptoJS.enc.Hex);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PinCodeTable WHERE isSkip = 1',
        [],
        (_, results) => {
          if (results.rows.length > 0) {
            tx.executeSql(
              'UPDATE PinCodeTable SET pinCode = ?, isActive = ?, isSkip = ? WHERE isSkip = 1',
              [hashedPin, 1, 0],
              () => console.log('Пин-код успешно обновлен в таблице.'),
              error => console.error('Ошибка при обновлении пин-кода:', error),
            );
          } else {
            tx.executeSql(
              'INSERT INTO PinCodeTable (pinCode, isActive, isSkip) VALUES (?, ?, ?)',
              [hashedPin, 1, 0],
              () => console.log('Пин-код успешно добавлен в таблицу.'),
              error => console.error('Ошибка при добавлении пин-кода:', error),
            );
          }
        },
        error =>
          console.error('Ошибка при проверке пин-кода в таблице:', error),
      );
    });
  };
};

const useAddSkipPinCodeVallue = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO PinCodeTable (isSkip) VALUES (?)',
        [1], // пишем в таблицу, что была пропущена регистрация пин кода
        (_, results) => {
          console.log('установка пин кода пропущена');
        },
        error => {
          console.error('Ошибка записи "isSkip" в таблицу:', error);
        },
      );
    });
  };
};

const useGetPinCode = () => {
  return setPinCode => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT pinCode FROM PinCodeTable',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const pinCode = results.rows.item(0).pinCode;
            setPinCode(pinCode);
          } else {
            setPinCode('');
          }
        },
        error => {
          console.log('Error fetching pin code:', error);
          setPinCode('');
        },
      );
    });
  };
};

const useCheckActivePinCode = () => {
  return callback => {
    db.transaction(tx => {
      // проверка активированного пин-кода
      tx.executeSql(
        'SELECT * FROM PinCodeTable WHERE isActive = 1',
        [],
        (tx, results) => {
          const isActive = results.rows.length > 0;

          // проверка пропущенного пин-кода
          tx.executeSql(
            'SELECT * FROM PinCodeTable WHERE isSkip = 1',
            [],
            (tx, results) => {
              const isSkip = results.rows.length > 0;

              callback(isActive, isSkip);
            },
            error => {
              console.error('Ошибка при проверке isSkip:', error);
              callback(isActive, false);
            },
          );
        },
        error => {
          console.error('Ошибка при проверке isActive:', error);
          callback(false, false);
        },
      );
    });
  };
};

const useDeletePinCode = () => {
  return inputPinCode => {
    return new Promise((resolve, reject) => {
      const inputPinHash = CryptoJS.SHA256(inputPinCode).toString(
        CryptoJS.enc.Hex,
      );

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM PinCodeTable WHERE isActive = 1',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              const storedPinCode = results.rows.item(0).pinCode;

              if (storedPinCode === inputPinHash) {
                tx.executeSql(
                  'DELETE FROM PinCodeTable WHERE isActive = 1',
                  [],
                  (tx, deleteResults) => {
                    console.log('Пин-код удален успешно');
                    resolve({success: true, message: 'Пин-код удален успешно'});
                  },
                  error => {
                    console.error('Ошибка при удалении пин-кода:', error);
                    reject({
                      success: false,
                      message: 'Ошибка при удалении пин-кода',
                    });
                  },
                );
              } else {
                console.log('Введенный пин-код не совпадает с сохраненным');
                reject({
                  success: false,
                  message: 'Введенный пин-код не совпадает с сохраненным',
                });
              }
            } else {
              console.log('Активный пин-код не найден в таблице');
              reject({
                success: false,
                message: 'Активный пин-код не найден в таблице',
              });
            }
          },
          error => {
            console.error('Ошибка при чтении из таблицы:', error);
            reject({success: false, message: 'Ошибка при чтении из таблицы'});
          },
        );
      });
    });
  };
};

export function usePinCodeRequest() {
  const savePinCode = useAddPinCodeToTable();
  const skipPin = useAddSkipPinCodeVallue();
  const getPinCodefromTable = useGetPinCode();
  const checkActivePinCode = useCheckActivePinCode();
  const deletePinCode = useDeletePinCode();

  return {
    savePinCode,
    skipPin,
    getPinCodefromTable,
    checkActivePinCode,
    deletePinCode,
  };
}
