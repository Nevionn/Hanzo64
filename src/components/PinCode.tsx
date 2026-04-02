import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
const {width, height} = Dimensions.get('window');

interface PinInputProps {
  onComplete?: (pin: string) => void;
  inputMode?: number;
  onReset?: () => void;
}

/**
 * PinCode – компонент для ввода и подтверждения PIN-кода (5 цифр)
 *
 * Основной функционал:
 * 1. Ввод PIN-кода пользователем (5 цифр).
 * 2. Подтверждение PIN-кода (если inputMode = 2).
 * 3. Сброс состояния при ошибке или внешнем сигнале.
 * 4. Вызов callback при успешном вводе PIN.
 *
 * @hook useEffect(scanAnimation)
 * Запускает бесконечную анимацию scan line:
 * - движение сверху вниз
 * - линейная интерполяция
 *
 * Анимация:
 * - scan line реализован через Animated.View
 * - используется translateY + interpolate
 * - бесконечный цикл через Animated.loop
 *
 * Ограничения:
 * - Максимальная длина PIN: 5 символов
 * - Используется только числовой ввод (0–9)
 *
 * @returns {JSX.Element} UI компонент ввода PIN-кода
 */

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
        prevPin.length < 5 ? prevPin + String(digit) : prevPin,
      );
    } else {
      setConfirmPin(prevPin =>
        prevPin.length < 5 ? prevPin + String(digit) : prevPin,
      );
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (initialPin.length === 5) {
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

  const scanAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.75],
  });

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
          {Array(5)
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
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scanLine,
            {
              transform: [{translateY}],
            },
          ]}
        />
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
    width: width * 0.85,
    borderRadius: 20,
    padding: 20,

    // стеклянная панель
    backgroundColor: 'rgba(15, 20, 40, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',

    // glow
    shadowColor: '#00F0FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,

    backgroundColor: 'rgba(0,255,255,0.4)',

    shadowColor: '#00F0FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,

    opacity: 0.7,
  },
  moveTextPinCode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    color: '#00F0FF',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',

    textShadowColor: '#00F0FF',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  pinContainerDisplay: {
    flexDirection: 'row',
    gap: 10,
  },
  pin: {
    width: 45,
    height: 55,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#00F0FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  pinText: {
    fontSize: 24,
    color: '#00F0FF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    width: 65,
    height: 65,
    margin: 6,
    borderRadius: 12,

    backgroundColor: '#0B1226',
    borderWidth: 1,
    borderColor: '#00F0FF',

    alignItems: 'center',
    justifyContent: 'center',

    // glow
    shadowColor: '#00F0FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 26,
    color: '#00F0FF',
    fontWeight: 'bold',
  },
  confirmButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 12,

    backgroundColor: '#00F0FF',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#00F0FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#020617',
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default PinCode;
