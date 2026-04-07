import SQLite from 'react-native-sqlite-storage';
import {connectionParamsDb} from '../services/database/databaseService';
import CryptoJS from 'crypto-js';

const db = SQLite.openDatabase({
  name: connectionParamsDb.name,
  location: connectionParamsDb.location,
});

db.transaction(tx => {
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS PinCodeTable (
     id INTEGER PRIMARY KEY AUTOINCREMENT, 
     pinCode TEXT, 
     isActive INTEGER DEFAULT 0, 
     isSkip INTEGER DEFAULT 0, 
     isWipeEnabled INTEGER DEFAULT 0, 
     failedAttempts INTEGER DEFAULT 0
    )
    `,
    [],
    (tx, results) => {
      console.log('Таблица пин кода создана');
    },
  );
});

// export const dropPinCodeTable = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         'DROP TABLE IF EXISTS PinCodeTable',
//         [],
//         () => {
//           console.log('Таблица PinCodeTable успешно удалена');
//           resolve({success: true});
//         },
//         error => {
//           console.error('Ошибка при удалении таблицы:', error);
//           reject(error);
//         },
//       );
//     });
//   });
// };

const useAddPinCodeToTable = () => {
  return pinCode => {
    const hashedPin = CryptoJS.SHA256(pinCode).toString(CryptoJS.enc.Hex);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PinCodeTable WHERE isSkip = 1 LIMIT 1',
        [],
        (_, results) => {
          if (results.rows.length > 0) {
            tx.executeSql(
              'UPDATE PinCodeTable SET pinCode = ?, isActive = 1, isSkip = 0 WHERE id = ?',
              [hashedPin, results.rows.item(0).id],
              () => console.log('Пин-код успешно обновлен.'),
              error => console.error('Ошибка обновления пин-кода:', error),
            );
          } else {
            tx.executeSql(
              'INSERT INTO PinCodeTable (pinCode, isActive, isSkip) VALUES (?, 1, 0)',
              [hashedPin],
              () => console.log('Пин-код успешно добавлен.'),
              error => console.error('Ошибка добавления пин-кода:', error),
            );
          }
        },
        error => console.error('Ошибка проверки пин-кода:', error),
      );
    });
  };
};

const useAddSkipPinCodeVallue = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM PinCodeTable WHERE isSkip = 1 LIMIT 1',
        [],
        (_, results) => {
          if (results.rows.length === 0) {
            tx.executeSql(
              'INSERT INTO PinCodeTable (isSkip) VALUES (1)',
              [],
              () => console.log('Пин-код пропущен.'),
              error => console.error('Ошибка вставки isSkip:', error),
            );
          } else {
            console.log(
              'Пропуск пин-кода уже существует, не добавляем дубликат.',
            );
          }
        },
        error => console.error('Ошибка проверки isSkip:', error),
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

const useToggleWipeOnFail = () => {
  return enabled => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE PinCodeTable SET isWipeEnabled = ?',
        [enabled ? 1 : 0],
        () => console.log('Wipe-on-fail обновлен'),
        error => console.error('Ошибка обновления wipe:', error),
      );
    });
  };
};

const useGetWipeOnFail = () => {
  return setValue => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT isWipeEnabled FROM PinCodeTable LIMIT 1',
        [],
        (_, results) => {
          if (results.rows.length > 0) {
            setValue(!!results.rows.item(0).isWipeEnabled);
          }
        },
      );
    });
  };
};

const useIncrementFailedAttempts = () => {
  return callback => {
    db.transaction(tx => {
      tx.executeSql(
        `
        UPDATE PinCodeTable 
        SET failedAttempts = failedAttempts + 1
        `,
        [],
        () => {
          tx.executeSql(
            'SELECT failedAttempts FROM PinCodeTable LIMIT 1',
            [],
            (_, res) => {
              const attempts = res.rows.item(0)?.failedAttempts || 0;
              callback(attempts);
            },
          );
        },
        error => console.error('Ошибка инкремента попыток:', error),
      );
    });
  };
};

const useResetFailedAttempts = () => {
  return () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE PinCodeTable SET failedAttempts = 0',
        [],
        () => console.log('Попытки сброшены'),
        error => console.error('Ошибка сброса попыток:', error),
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

const useForceDeletePinCode = () => {
  return () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM PinCodeTable',
          [],
          () => {
            console.log('Все записи PinCodeTable удалены (force delete)');
            resolve({success: true});
          },
          error => {
            console.error('Ошибка force delete:', error);
            reject({success: false});
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
  const toggleWipeOnFail = useToggleWipeOnFail();
  const getWipeOnFail = useGetWipeOnFail();
  const incrementFailedAttempts = useIncrementFailedAttempts();
  const resetFailedAttempts = useResetFailedAttempts();
  const deletePinCode = useDeletePinCode();
  const forceDeletePinCode = useForceDeletePinCode();

  return {
    savePinCode,
    skipPin,
    getPinCodefromTable,
    checkActivePinCode,
    toggleWipeOnFail,
    getWipeOnFail,
    incrementFailedAttempts,
    resetFailedAttempts,
    deletePinCode,
    forceDeletePinCode,
  };
}
