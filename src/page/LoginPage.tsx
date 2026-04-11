import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLOR} from '../shared/colorTheme';
import PinCode from '../components/PinCode';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {usePhotoRequest} from '../hooks/usePhotoRequest';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

/**
 * LoginPage – страница авторизации пользователя через PIN-код.
 *
 * Данная страница отвечает за:
 * 1. Получение сохранённого PIN-кода (в виде хеша) из локальной базы данных.
 * 2. Ввод PIN-кода пользователем через компонент PinCode.
 * 3. Сравнение хеша введённого PIN с хешем из базы данных.
 * 4. Навигацию на главную страницу при успешной авторизации.
 * 5. Обработку ошибки при неверном PIN-коде с последующим сбросом ввода.
 * 6. Блокировку ввода на заданное время (3 минуты) после 3 неудачных попыток.
 * 7. Удаление всех данных при 3 проваленных попытках, если включен режим wipeEnabled.
 *
 * Используемые состояния:
 * @property {string} rightPinCodeHash - Хеш PIN-кода, полученный из базы данных.
 * @property {string} inputPinCode - PIN-код, введённый пользователем.
 * @property {boolean} shouldResetPin - Флаг для сброса состояния компонента PinCode.
 * @property {boolean} wipeEnabled - Флаг, разрешающий удаление данных при 3 ошибках.
 * @property {boolean} isLocked - Флаг заблокированного ввода PIN.
 * @property {number | null} lockUntil - Метка времени окончания блокировки.
 *
 * Используемые хуки:
 * @hook useEffect(getPinCodefromTable)
 * Загружает хеш PIN-кода из базы данных при монтировании компонента.
 *
 * @hook useEffect(checkLock)
 * Проверяет наличие активной блокировки в AsyncStorage при загрузке компонента.
 *
 * @hook useEffect(comparePinHashes)
 * Отслеживает изменения inputPinCode и выполняет:
 * - Хеширование введённого PIN-кода через SHA-256
 * - Сравнение с сохранённым хешем
 * - Навигацию на MainPage при совпадении
 * - Инкремент неудачных попыток
 * - Блокировку или удаление данных при превышении лимита попыток
 * - Сброс состояния компонента PinCode при ошибке
 *
 * Функции:
 * @function handlePinComplete - принимает PIN пользователя и обновляет состояние inputPinCode.
 * @function handleResetPin - сбрасывает состояние ввода PIN.
 * @function approvalAuthorization - навигация на MainPage и сброс счётчика ошибок.
 * @function handleUnlock - снимает блокировку, очищает lockUntil и сбрасывает PIN.
 *
 * Безопасность:
 * - Используется SHA-256 хеширование перед сравнением.
 *
 * @returns {JSX.Element} Страница авторизации с компонентом PinCode
 */

const LoginPage = () => {
  const navigation: any = useNavigation();

  const {
    getPinCodefromTable,
    getWipeOnFail,
    incrementFailedAttempts,
    resetFailedAttempts,
  } = usePinCodeRequest();

  const {deleteAllAlbums} = useAlbumsRequest();
  const {deleteAllPhotos} = usePhotoRequest();

  const [rightPinCodeHash, setRightPinCodeHash] = useState('');
  const [inputPinCode, setInputPinCode] = useState('');
  const [shouldResetPin, setShouldResetPin] = useState(false);

  const [wipeEnabled, setWipeEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const LOCK_KEY = 'PIN_LOCK_UNTIL';
  const LOCK_DURATION = 3 * 60 * 1000;
  const minutes = Math.floor(LOCK_DURATION / 1000 / 60);

  const handlePinComplete = (pin: string) => {
    setInputPinCode('');
    setTimeout(() => {
      setInputPinCode(pin);
    }, 0);
  };

  const handleResetPin = () => {
    setShouldResetPin(true);
  };

  const approvalAuthorization = () => {
    resetFailedAttempts();
    navigation.replace('MainPage');
  };

  const handleUnlock = async () => {
    setIsLocked(false);
    setLockUntil(null);
    await AsyncStorage.removeItem(LOCK_KEY);
    setShouldResetPin(true);
  };

  useEffect(() => {
    getPinCodefromTable(setRightPinCodeHash);
    getWipeOnFail(setWipeEnabled);
  }, []);

  useEffect(() => {
    const checkLock = async () => {
      const lockUntilStr = await AsyncStorage.getItem(LOCK_KEY);
      if (!lockUntilStr) return;

      const lockTime = Number(lockUntilStr);
      if (Date.now() < lockTime) {
        setLockUntil(lockTime);
        setIsLocked(true);
      } else {
        await AsyncStorage.removeItem(LOCK_KEY);
      }
    };
    checkLock();
  }, []);

  useEffect(() => {
    if (!inputPinCode) return;

    const inputPinHash = CryptoJS.SHA256(inputPinCode).toString(
      CryptoJS.enc.Hex,
    );

    if (rightPinCodeHash && inputPinHash === rightPinCodeHash) {
      approvalAuthorization();
    } else {
      console.log('❌ Неверный PIN');

      const handleFailed = async (attempts: number) => {
        if (wipeEnabled && attempts >= 3) {
          deleteAllAlbums();
          deleteAllPhotos();
          Alert.alert(
            'Данные удалены',
            'Превышено количество попыток. Все данные удалены.',
          );
          setTimeout(() => approvalAuthorization(), 2000);
          return;
        }

        if (!wipeEnabled && attempts >= 3) {
          const newLockUntil = Date.now() + LOCK_DURATION;
          await AsyncStorage.setItem(LOCK_KEY, newLockUntil.toString());
          setLockUntil(newLockUntil);
          setIsLocked(true);
          Alert.alert(
            'Блокировка',
            `Ввод PIN-кода заблокирован на ${minutes} минуты`,
          );
          handleResetPin();
          return;
        }

        Alert.alert('Неверный PIN', `Попытка ${attempts}/3`);
      };

      incrementFailedAttempts(handleFailed);
      handleResetPin();
    }
  }, [inputPinCode, rightPinCodeHash]);

  return (
    <ImageBackground
      style={styles.root}
      source={require('../../assets/images/bg1.png')}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <PinCode
        onComplete={handlePinComplete}
        inputMode={1}
        isLocked={isLocked}
        lockUntil={lockUntil || undefined}
        onReset={shouldResetPin ? () => setShouldResetPin(false) : undefined}
        onUnlock={handleUnlock}
      />
    </ImageBackground>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.dark.MAIN_COLOR,
  },
  greetingsItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.75,
    width: width * 0.75,
  },
  buttonsItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 10,
  },
  startButton: {
    height: 38,
    width: 110,
    borderRadius: 20,
  },
  text: {
    color: 'white',
    alignItems: 'center',
    fontSize: 20,
  },
  highlight: {
    fontSize: 20,
    color: 'aqua',
    fontWeight: 'bold',
  },
  textButtonSetPinCode: {
    color: 'aqua',
    fontWeight: 'bold',
  },
});
