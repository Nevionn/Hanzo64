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
import CryptoJS from 'crypto-js';

const {width, height} = Dimensions.get('window');

/**
 * LoginPage – страница авторизации пользователя через PIN-код.
 *
 * Данная страница отвечает за:
 * 1. Получение сохранённого PIN-кода (в виде хеша) из локальной базы данных.
 * 2. Ввод PIN-кода пользователем через компонент PinCode.
 * 4. Сравнение хеша введённого PIN с хешем из базы данных.
 * 5. Навигацию на главную страницу при успешной авторизации.
 * 6. Обработку ошибки при неверном PIN-коде с последующим сбросом ввода.
 *
 * Используемые состояния:
 * @property {string} rightPinCodeHash - Хеш PIN-кода, полученный из базы данных.
 * @property {string} inputPinCode - PIN-код, введённый пользователем.
 * @property {boolean} shouldResetPin - Флаг для сброса состояния компонента PinCode.
 *
 * Хуки:
 * @hook useEffect(getPinCodefromTable)
 * Загружает хеш PIN-кода из базы данных при монтировании компонента.
 *
 * @hook useEffect(comparePinHashes)
 * Выполняет:
 * - Хеширование введённого PIN-кода через SHA-256
 * - Сравнение с сохранённым хешем
 * - Навигацию при успехе
 * - Показ ошибки и сброс ввода при несовпадении
 *
 * Безопасность:
 * - Используется SHA-256 хеширование перед сравнением
 *
 * @returns {JSX.Element} Экран ввода PIN-кода
 */

const LoginPage = () => {
  const navigation: any = useNavigation();

  const {getPinCodefromTable} = usePinCodeRequest();
  const [rightPinCodeHash, setRightPinCodeHash] = useState('');
  const [inputPinCode, setInputPinCode] = useState('');
  const [shouldResetPin, setShouldResetPin] = useState(false);

  const handlePinComplete = (pin: string) => {
    setInputPinCode(pin);
  };

  const handleResetPin = () => {
    setShouldResetPin(true);
  };

  useEffect(() => {
    getPinCodefromTable(setRightPinCodeHash);
  }, []);

  useEffect(() => {
    if (inputPinCode) {
      const inputPinHash = CryptoJS.SHA256(inputPinCode).toString(
        CryptoJS.enc.Hex,
      );

      if (rightPinCodeHash && inputPinHash === rightPinCodeHash) {
        console.log('Пин-код совпадает');
        navigation.replace('MainPage');
      } else {
        Alert.alert('Неверный пин-код,\nпопробуйте снова');
        handleResetPin();
      }
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
        onReset={shouldResetPin ? () => setShouldResetPin(false) : undefined}
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
