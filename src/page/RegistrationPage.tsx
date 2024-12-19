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
import {Button} from 'react-native-paper';
import PinCode from '../components/PinCode';
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const RegistrationPage = () => {
  const {savePinCode, skipPin, deletePinCode} = usePinCodeRequest();
  const route: any = useRoute();
  const navigation: any = useNavigation();

  const [inputMode, setInputMode] = useState(2);
  const [installationPinStage, setInstallationPinStage] = useState(false);
  const [instruction, setInstruction] = useState<'delete' | ''>('');
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
          <Text style={styles.nameApp}>HANZA64</Text>
          <Text style={styles.text}>
            Добро пожаловать в защищенную галерею{'\n'}
            Для безопасности <Text style={styles.highlight}>
              рекомендуется
            </Text>{' '}
            установить пин код
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
    paddingVertical: 12,
    paddingHorizontal: 20,
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
