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
import {useNavigation, useRoute} from '@react-navigation/native';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';
import {COLOR} from '../../assets/colorTheme';
import Cbutton from '../components/Cbutton';
import PinCode from '../components/PinCode';
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const RegistrationPage = () => {
  const {savePinCode, skipPin, deletePinCode} = usePinCodeRequest();
  const route: any = useRoute();
  const navigation: any = useNavigation();

  const [inputMode, setInputMode] = useState(2);
  const [installationPinStage, setInstallationPinStage] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [shouldResetPin, setShouldResetPin] = useState(false);

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
              colorButton={{backgroundColor: COLOR.dark.BUTTON_COLOR_INACTIVE}}
              isShadow={true}
              isVisible={true}
              name={'Пропустить'}
              onPress={() => {
                skipInstallPinCode();
              }}
            />
            <Cbutton
              styleButton={styles.startButton}
              styleText={styles.textButtonSetPinCode}
              colorButton={{backgroundColor: COLOR.dark.BUTTON_COLOR}}
              isShadow={true}
              isVisible={true}
              name={'Установить пин-код'}
              onPress={() => {
                setInstallationPinStage(true);
              }}
            />
          </View>
        </View>
      ) : (
        <PinCode
          onComplete={handlePinComplete}
          inputMode={inputMode}
          onReset={shouldResetPin ? () => setShouldResetPin(false) : undefined}
        />
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
    backgroundColor: COLOR.dark.MAIN_COLOR,
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
    flexDirection: 'row',
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
