import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import {COLOR} from '../../assets/colorTheme';

interface PinInputProps {
  onComplete?: (pin: string) => void;
}

const PinCode: React.FC<PinInputProps> = ({onComplete}) => {
  const [initialPin, setInitialPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // Шаг 1 - ввод PIN, Шаг 2 - подтверждение PIN

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
        setStep(2);
      } else {
        Alert.alert('Введите полный PIN-код');
      }
    } else {
      if (confirmPin === initialPin) {
        Alert.alert('Переход в галлерею');
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
      <Text style={styles.text}>
        {step === 1 ? 'Введите PIN-код' : 'Повторите PIN-код'}
      </Text>
      <View style={styles.pinContainerDisplay}>
        {Array(4)
          .fill('')
          .map((_, index) => (
            <View key={index} style={styles.pin}>
              <Text style={styles.pinText}>
                {step === 1 ? initialPin[index] || '' : confirmPin[index] || ''}
              </Text>
            </View>
          ))}
      </View>
      <View style={styles.buttonContainer}>
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
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  pinContainerDisplay: {
    flexDirection: 'row',
    marginTop: 50,
    backgroundColor: 'transparent',
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
    width: 253,
    backgroundColor: 'transparent',
    marginTop: 40,
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: COLOR.BUTTON_PIN_COLOR,
    margin: 5,
    marginTop: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLOR.BUTTON_COLOR,
  },
  text: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
    top: 140,
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
