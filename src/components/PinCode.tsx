import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
const {width, height} = Dimensions.get('window');

interface PinInputProps {
  onComplete?: (pin: string) => void;
  inputMode?: number;
  onReset?: () => void;
}

const PinCode: React.FC<PinInputProps> = ({onComplete, inputMode, onReset}) => {
  const [initialPin, setInitialPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // Шаг 1 - ввод PIN, Шаг 2 - подтверждение PIN

  const [pinCodeWidth, setPinCodeWidth] = useState(0);

  const clearPinCode = () => {
    setInitialPin('');
  };

  useEffect(() => {
    if (onReset) {
      clearPinCode();
    }
  }, [onReset]);

  const handleDelete = () => {
    if (step === 1) {
      setInitialPin(prevPin => prevPin.slice(0, -1));
    } else {
      setConfirmPin(prevPin => prevPin.slice(0, -1));
    }
  };

  const handleDigitPress = (digit: number) => {
    if (step === 1) {
      setInitialPin(prevPin =>
        prevPin.length < 4 ? prevPin + String(digit) : prevPin,
      );
    } else {
      setConfirmPin(prevPin =>
        prevPin.length < 4 ? prevPin + String(digit) : prevPin,
      );
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (initialPin.length === 4) {
        if (inputMode === 2) {
          setStep(2);
        } else {
          if (onComplete) {
            onComplete(initialPin);
          }
        }
      } else {
        Alert.alert('Введите полный PIN-код');
      }
    } else {
      if (confirmPin === initialPin) {
        if (onComplete) {
          onComplete(initialPin);
        }
      } else {
        Alert.alert('PIN-коды не совпадают. Попробуйте снова');
        setInitialPin('');
        setConfirmPin('');
        setStep(1);
      }
    }
  };

  return (
    <View style={styles.root}>
      <View
        style={styles.pinCodeItem}
        onLayout={event => setPinCodeWidth(event.nativeEvent.layout.width)}>
        <View style={styles.moveTextPinCode}>
          <Text style={styles.text}>
            {step === 1 ? 'Введите PIN-код' : 'Повторите PIN-код'}
          </Text>
        </View>
        <View style={styles.pinContainerDisplay}>
          {Array(4)
            .fill('')
            .map((_, index) => (
              <View key={index} style={styles.pin}>
                <Text style={styles.pinText}>
                  {step === 1
                    ? initialPin[index] || ''
                    : confirmPin[index] || ''}
                </Text>
              </View>
            ))}
        </View>
        <View style={[styles.buttonContainer, {width: pinCodeWidth * 0.8}]}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0].map((digit, index) =>
            digit === null ? (
              <View
                key={`empty-${index}`}
                style={[styles.button, {opacity: 0}]}
              />
            ) : (
              <TouchableOpacity
                key={`digit-${digit}-${index}`}
                style={styles.button}
                onPress={() => handleDigitPress(digit)}>
                <Text style={styles.buttonText}>{digit}</Text>
              </TouchableOpacity>
            ),
          )}
          <TouchableOpacity style={styles.button} onPress={handleDelete}>
            <Text style={styles.buttonText}>⌫</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleNextStep}>
          <Text style={styles.confirmButtonText}>
            {step === 1 ? 'Далее' : 'Подтвердить'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pinCodeItem: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'column',
    height: height * 0.75,
    width: width * 0.8,
  },
  pinContainerDisplay: {
    flexDirection: 'row',
  },
  pin: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderColor: '#2D7FE1',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: COLOR.dark.BUTTON_PIN_COLOR,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLOR.dark.BUTTON_COLOR,
  },
  moveTextPinCode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 24,
  },
  confirmButtonText: {
    fontSize: 18,
    color: 'white',
  },
  pinText: {
    fontSize: 24,
    color: 'white',
  },
});

export default PinCode;
