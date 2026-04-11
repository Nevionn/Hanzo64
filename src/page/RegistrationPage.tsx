import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
const {width, height} = Dimensions.get('window');
import {useNavigation, useRoute} from '@react-navigation/native';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';
import {usePhotoRequest} from '../hooks/usePhotoRequest';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';

import {COLOR} from '../shared/colorTheme';
import {TYPOGRAPHY} from '../shared/typography';
import {ModalText} from '../shared/textForModal';

import {Button} from 'react-native-paper';

import PinCode from '../components/PinCode';
import AcceptMoveModal from '../components/modals/AcceptMoveModal';

/**
 * RegistrationPage – страница регистрации пользователя с установкой или подтверждением PIN-кода.
 *
 * Эта страница позволяет:
 * 1. Отобразить приветствие и предложение установить PIN-код.
 * 2. Пропустить установку PIN-кода.
 * 3. Установить новый PIN-код (5-значный).
 * 4. Удалить PIN-код, если пришла соответствующая инструкция.
 *
 * Используемые состояния:
 * @property {number} inputMode - Режим ввода PIN-кода (1 – только ввод, 2 – ввод и подтверждение).
 * @property {boolean} installationPinStage - Определяет, показывать ли экран приветствия или компонент PinCode.
 * @property {'delete' | ''} instruction - Инструкция для PIN-кода ('delete' – удалить PIN, '' – обычная установка).
 * @property {string} pinCode - Значение введенного PIN-кода.
 * @property {boolean} shouldResetPin - Флаг для сброса компонента PinCode при ошибке.
 *
 * Используемые функции:
 * @function handlePinComplete - Обработчик завершения ввода PIN-кода.
 * @function handleResetPin - Сбрасывает ввод PIN-кода.
 * @function skipInstallPinCode - Пропустить установку PIN-кода и перейти на главную страницу.
 * @function onLoginSuccess - Навигация на главную страницу после успешного сохранения PIN.
 * @function handleDeletePinCode - Удаление сохраненного PIN-кода с проверкой совпадения.
 *
 * Хуки:
 * - useEffect(updatePinCodeFlow) – обновляет состояния страницы на основе параметров маршрута.
 * - useEffect(interactionWithPinCode) – реагирует на изменение pinCode и instruction для сохранения или удаления PIN.
 *
 * Компоненты:
 * - PinCode – компонент для ввода и подтверждения PIN-кода.
 *
 * @returns {JSX.Element}
 */

const RegistrationPage = () => {
  const {savePinCode, skipPin, deletePinCode, forceDeletePinCode} =
    usePinCodeRequest();
  const {deleteAllAlbums} = useAlbumsRequest();
  const {deleteAllPhotos} = usePhotoRequest();

  const route: any = useRoute();
  const navigation: any = useNavigation();

  const [inputMode, setInputMode] = useState(2);
  const [installationPinStage, setInstallationPinStage] = useState(false);
  const [instruction, setInstruction] = useState<'delete' | ''>('');
  const [pinCode, setPinCode] = useState('');
  const [shouldResetPin, setShouldResetPin] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePinComplete = (pin: string) => {
    setPinCode(pin);
  };

  const handleResetPin = () => {
    setShouldResetPin(true);
  };

  const skipInstallPinCode = () => {
    skipPin();
    onLoginSuccess();
  };

  const onLoginSuccess = () => {
    navigation.replace('MainPage');
  };

  const handleDeletePinCode = async () => {
    try {
      const result = await deletePinCode(pinCode);
      if (result.success) {
        onLoginSuccess();
      }
    } catch (error) {
      Alert.alert('Введенный пин-код не совпадает с сохраненным');
      handleResetPin();
    }
  };

  const handleForgotPinCode = async () => {
    try {
      await deleteAllAlbums();
      await deleteAllPhotos();
      await forceDeletePinCode();
      setIsModalVisible(false);
      onLoginSuccess();
    } catch (e) {
      console.error('Ошибка при форс удалении:', e);
    }
  };

  useEffect(
    function updatePinCodeFlow() {
      const initialPinStage = route.params?.installationPinStage ?? false;
      const mode = route.params?.inputMode ?? 2;
      const instructionValue = route.params?.instruction ?? '';

      setInstallationPinStage(initialPinStage);
      setInputMode(mode);
      setInstruction(instructionValue);
    },
    [route.params],
  );

  useEffect(
    function interactionWithPinCode() {
      if (pinCode) {
        if (instruction === 'delete') {
          handleDeletePinCode();
        } else {
          savePinCode(pinCode);
          onLoginSuccess();
        }
      }
    },
    [pinCode, instruction],
  );

  return (
    <>
      <ImageBackground
        style={styles.root}
        source={require('../../assets/images/bg1.png')}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        {!installationPinStage ? (
          <View style={styles.greetingsItem}>
            <Text style={styles.nameApp}>PHOVION64</Text>
            <Text style={styles.text}>
              Добро пожаловать в защищенную галерею{'\n'}
              Для безопасности{' '}
              <Text style={styles.highlight}>рекомендуется</Text> установить пин
              код
            </Text>

            <View style={styles.buttonsItem}>
              <Button
                style={styles.startButton}
                labelStyle={styles.textButton}
                mode="contained"
                buttonColor={COLOR.dark.BUTTON_COLOR}
                onPress={() => {
                  setInstallationPinStage(true);
                }}>
                Установить пин-код
              </Button>
              <Button
                style={styles.startButton}
                labelStyle={styles.textButton}
                mode="contained"
                buttonColor={COLOR.dark.BUTTON_COLOR_INACTIVE}
                onPress={() => {
                  skipInstallPinCode();
                }}>
                Пропустить
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.pinWrapper}>
            <PinCode
              onComplete={handlePinComplete}
              inputMode={inputMode}
              onReset={
                shouldResetPin ? () => setShouldResetPin(false) : undefined
              }
            />

            {instruction === 'delete' && (
              <Button
                mode="text"
                style={styles.forgotButton}
                labelStyle={styles.forgotButtonText}
                onPress={() => setIsModalVisible(true)}>
                Забыли PIN-код?
              </Button>
            )}
          </View>
        )}
      </ImageBackground>
      <AcceptMoveModal
        visible={isModalVisible}
        title={ModalText.forceDeletePinCode.title}
        textBody={ModalText.forceDeletePinCode.textBody}
        onCloseAcceptModal={() => setIsModalVisible(false)}
        onConfirm={handleForgotPinCode}
        requireConfirmationText={true}
        confirmationWord="DELETE"
      />
    </>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.dark.MAIN_COLOR,
  },
  greetingsItem: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    height: height * 0.75,
    width: width * 0.75,
  },
  buttonsItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'black',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotButton: {},
  forgotButtonText: {
    color: 'aqua',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.generalFont,
  },
  nameApp: {
    color: COLOR.NAME_APP,
    fontSize: 44,
    fontFamily: 'Impact Regular',
    textTransform: 'uppercase',
    textShadowColor: 'black',
    textShadowOffset: {width: 10, height: 10},
    textShadowRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Impact Regular',
    textTransform: 'uppercase',
    textShadowColor: 'black',
    textShadowOffset: {width: 10, height: 10},
    textShadowRadius: 10,
  },
  textButton: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Impact Regular',
    textTransform: 'uppercase',
    textShadowColor: 'black',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 1,
  },
  highlight: {
    fontSize: 20,
    color: 'aqua',
    fontWeight: 'bold',
  },
});
