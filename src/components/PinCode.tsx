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
import {TYPOGRAPHY} from '../shared/typography';

interface PinInputProps {
  onComplete?: (pin: string) => void;
  inputMode?: number;
  isLocked?: boolean;
  lockUntil?: number;
  onReset?: () => void;
  onUnlock?: () => void;
}

/**
 * PinCode – компонент для ввода и подтверждения PIN-кода.
 *
 * Основной функционал:
 * 1. Ввод PIN-кода пользователем (5 цифр).
 * 2. Подтверждение PIN-кода (если inputMode = 2).
 * 3. Сброс состояния при ошибке или внешнем сигнале (onReset).
 * 4. Вызов callback onComplete при успешном вводе PIN.
 * 5. Блокировка ввода при isLocked=true и отображение таймера.
 *
 * Props:
 * @param {function(string):void} [onComplete] - callback при успешном вводе PIN.
 * @param {number} [inputMode] - режим ввода (1 – обычный ввод, 2 – подтверждение PIN).
 * @param {boolean} [isLocked] - флаг заблокированного ввода.
 * @param {number} [lockUntil] - метка времени окончания блокировки.
 * @param {function():void} [onReset] - callback для сброса состояния PIN.
 * @param {function():void} [onUnlock] - callback при снятии блокировки.
 *
 * Состояния:
 * @property {string} initialPin - текущий вводимый PIN.
 * @property {string} confirmPin - подтверждение PIN (при inputMode=2).
 * @property {number} step - шаг ввода (1 – ввод, 2 – подтверждение).
 * @property {number} timer - количество секунд до разблокировки.
 *
 * Анимации:
 * @hook useEffect(scanAnimation)
 * Запускает бесконечную анимацию scan line:
 * - движение сверху вниз
 * - линейная интерполяция
 *
 * Ограничения:
 * - Максимальная длина PIN: 5 цифр
 * - Используется только числовой ввод (0–9)
 * - При блокировке (isLocked=true) кнопки становятся неактивными
 *
 * Функции:
 * @function handleDigitPress - добавляет цифру к текущему PIN.
 * @function handleDelete - удаляет последнюю цифру PIN.
 * @function handleNextStep - переходит к следующему шагу или вызывает onComplete.
 *
 * @returns {JSX.Element} UI компонент ввода PIN-кода с таймером блокировки и анимацией scan line
 */

const PinCode: React.FC<PinInputProps> = ({
  onComplete,
  inputMode,
  isLocked,
  lockUntil,
  onReset,
  onUnlock,
}) => {
  const [initialPin, setInitialPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);

  const [pinCodeWidth, setPinCodeWidth] = useState(0);

  const clearPinCode = () => {
    setInitialPin('');
  };

  useEffect(() => {
    if (onReset) clearPinCode();
  }, [onReset]);

  useEffect(() => {
    let interval: number;

    if (isLocked && lockUntil) {
      const updateTimer = () => {
        const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
        setTimer(remaining > 0 ? remaining : 0);

        if (remaining <= 0 && onUnlock) {
          onUnlock();
          if (onReset) onReset();
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000) as unknown as number;

      return () => clearInterval(interval);
    }
  }, [isLocked, lockUntil, onReset]);

  const formatTimeToUi = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (isLocked) return;

    if (step === 1) {
      setInitialPin(prevPin => prevPin.slice(0, -1));
    } else {
      setConfirmPin(prevPin => prevPin.slice(0, -1));
    }
  };

  const handleDigitPress = (digit: number) => {
    if (isLocked) return;

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
    if (isLocked) return;

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
                disabled={isLocked}
                style={[styles.button, isLocked && {opacity: 0.3}]}
                onPress={() => handleDigitPress(digit)}>
                <Text style={styles.buttonText}>{digit}</Text>
              </TouchableOpacity>
            ),
          )}
          <TouchableOpacity
            disabled={isLocked}
            style={[styles.button, isLocked && {opacity: 0.3}]}
            onPress={handleDelete}>
            <Text style={styles.buttonText}>⌫</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          disabled={isLocked}
          style={[styles.confirmButton, isLocked && {opacity: 0.3}]}
          onPress={handleNextStep}>
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
      {isLocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockText}>
            Заблокировано: {formatTimeToUi(timer)}
          </Text>
        </View>
      )}
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
    fontFamily: TYPOGRAPHY.generalFont,
    fontSize: 20,
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
    fontFamily: TYPOGRAPHY.generalFont,
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
    fontFamily: TYPOGRAPHY.generalFont,
    fontSize: 26,
    color: '#00F0FF',
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
    fontFamily: TYPOGRAPHY.generalFont,
    fontSize: 18,
    color: '#020617',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    color: '#00F0FF',
    fontSize: 20,
    fontFamily: TYPOGRAPHY.generalFont,
  },
  lockTimer: {
    marginTop: 10,
    fontSize: 18,
    color: '#00F0FF',
  },
});

export default PinCode;
