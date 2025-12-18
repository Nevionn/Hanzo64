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
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');
import PinCode from '../components/PinCode';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';

const LoginPage = () => {
  const navigation: any = useNavigation();
  const {getPinCodefromTable} = usePinCodeRequest();
  const [rightPinCodeFromDb, setRightPinCodeFromDb] = useState('');
  const [inputPinCode, setInputPinCode] = useState('');
  const [shouldResetPin, setShouldResetPin] = useState(false);

  const handlePinComplete = (pin: string) => {
    setInputPinCode(pin);
  };

  const handleResetPin = () => {
    setShouldResetPin(true);
  };

  useEffect(() => {
    getPinCodefromTable(setRightPinCodeFromDb);
  }, []);

  useEffect(() => {
    if (inputPinCode) {
      if (rightPinCodeFromDb === inputPinCode) {
        console.log('пин код совпадает');
        navigation.replace('MainPage');
      } else {
        Alert.alert('Неверный пин код,\nпопробуйте снова');
        handleResetPin();
      }
    }
  }, [inputPinCode]);

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
