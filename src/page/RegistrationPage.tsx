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
import {useNavigation} from '@react-navigation/native';
import {COLOR} from '../../assets/colorTheme';
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');
import Cbutton from '../components/Cbutton';
import PinCode from '../components/PinCode';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';

const RegistrationPage = () => {
  const {
    savePinCode,
    checkActivePinCode,
    dropTable,
    showTableContent,
    showTables,
    showScheme,
  } = usePinCodeRequest();
  const navigation: any = useNavigation();
  const [installationPinStage, setInstallationPinStage] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [isPinActive, setIsPinActive] = useState(false);
  // const [skipInstallPinCode, setSkipInstallPinCode] = useState(false);

  const handlePinComplete = (pin: string) => {
    setPinCode(pin);
  };

  const onLoginSuccess = () => {
    navigation.replace('MainPage');
  };

  const redirectToLoginPage = () => {
    navigation.replace('LoginPage');
  };

  useEffect(() => {
    checkActivePinCode((isActive: boolean) => {
      setIsPinActive(isActive);
      if (isActive) {
        redirectToLoginPage();
      }
    });
  }, []); // проверка на установленный пин код и редирект на подтверждение

  useEffect(() => {
    if (pinCode) {
      savePinCode(pinCode);
      onLoginSuccess();
    }
  }, [pinCode]); // зарегали пин код и зашли на главную стр

  return (
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
          <Text style={styles.text}>
            Добро пожаловать в защищенную галерею{'\n'}
            Для безопасности <Text style={styles.highlight}>
              рекомендуется
            </Text>{' '}
            установить пин код
          </Text>
          <View style={styles.buttonsItem}>
            <Cbutton
              styleButton={styles.startButton}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR_INACTIVE}}
              isShadow={true}
              isVisible={true}
              name={'Пропустить'}
              onPress={() => {
                onLoginSuccess();
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Установить пин-код'}
              onPress={() => {
                setInstallationPinStage(true);
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Проверить таблицу'}
              onPress={() => {
                showTables();
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Проверить пинкод'}
              onPress={() => {
                showTableContent();
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Удалить таблицу'}
              onPress={() => {
                dropTable('PinCodeTable');
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Схема'}
              onPress={() => {
                showScheme('PinCodeTable');
              }}
            />
          </View>
        </View>
      ) : (
        <PinCode onComplete={handlePinComplete} />
      )}
    </ImageBackground>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.MAIN_COLOR,
  },
  greetingsItem: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: COLOR.SECONDARY_COLOR,
    height: height * 0.75,
    width: width * 0.75,
  },
  buttonsItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column', // row
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
