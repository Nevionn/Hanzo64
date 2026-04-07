import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  StatusBar,
  TextInput,
} from 'react-native';
import {useSettingsStore} from '../../store/settings/useSettingsStore';
import {COLOR} from '../../shared/colorTheme';
import {Button} from 'react-native-paper';
import SvgAlert from '../icons/SvgAlert';

interface AcceptMoveModalProps {
  visible: boolean;
  onCloseAcceptModal: () => void;
  onConfirm: () => void;
  title: string;
  textBody: string;

  requireConfirmationText?: boolean;
  confirmationWord?: string;
}

/**
 * AcceptMoveModal – универсальное модальное окно для подтверждения опасных действий.
 *
 * Компонент отображает заголовок, описание, иконку предупреждения и кнопки действия.
 * Опционально может требовать ввода определённого слова для подтверждения действия,
 * чтобы предотвратить случайное нажатие кнопки.
 *
 * @component
 *
 * @param {boolean} [requireConfirmationText=false] – Если true, пользователь должен ввести confirmationWord для активации кнопки "Удалить".
 * @param {string} [confirmationWord='DELETE'] – Слово, которое пользователь должен ввести для подтверждения действия.
 *
 * @returns {JSX.Element}
 */

const AcceptMoveModal: React.FC<AcceptMoveModalProps> = ({
  visible,
  onCloseAcceptModal,
  onConfirm,
  title,
  textBody,
  requireConfirmationText,
  confirmationWord,
}) => {
  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);

  const [inputValue, setInputValue] = useState('');

  const isConfirmEnabled = requireConfirmationText
    ? inputValue.trim().toLowerCase() ===
      (confirmationWord || 'delete').toLowerCase()
    : true;

  const handleClose = () => {
    setInputValue('');
    onCloseAcceptModal();
  };

  const styles = getStyles(darkModeFromStore);
  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onCloseAcceptModal}>
        <StatusBar translucent backgroundColor="black" />
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.textItem}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.topSpacer} />
              <View style={styles.centerItemContent}>
                <SvgAlert />
                <Text style={styles.text}>{textBody}</Text>
              </View>
            </View>
            {requireConfirmationText && (
              <View style={{marginTop: 20}}>
                <Text style={styles.text}>
                  Введите "{confirmationWord || 'DELETE'}" для подтверждения
                </Text>
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  style={styles.input}
                  placeholder="Введите слово"
                  placeholderTextColor="#888"
                />
              </View>
            )}
            <View style={styles.buttonsItem}>
              <Button
                mode="elevated"
                textColor={COLOR.dark.TEXT_BRIGHT}
                style={styles.button}
                buttonColor={
                  darkModeFromStore
                    ? COLOR.dark.BUTTON_COLOR
                    : COLOR.light.BUTTON_COLOR
                }
                disabled={!isConfirmEnabled}
                onPress={() => {
                  setInputValue('');
                  onConfirm();
                }}>
                Удалить
              </Button>
              <Button
                mode="elevated"
                textColor={COLOR.dark.TEXT_BRIGHT}
                buttonColor={
                  darkModeFromStore
                    ? COLOR.dark.BUTTON_COLOR
                    : COLOR.light.BUTTON_COLOR
                }
                onPress={() => handleClose()}>
                Отмена
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '88%',
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
      padding: 20,
      borderRadius: 8,
    },
    topSpacer: {
      height: 20,
    },
    textItem: {},
    buttonsItem: {
      justifyContent: 'flex-end',
      flexDirection: 'row',
      marginTop: 40,
    },
    centerItemContent: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    button: {
      marginHorizontal: 14,
    },
    title: {
      textAlign: 'left',
      fontSize: 18,
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    text: {
      textAlign: 'left',
      flexWrap: 'wrap',
      maxWidth: '86%',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
    input: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#888',
      borderRadius: 6,
      padding: 8,
      color: darkMode ? 'white' : 'black',
    },
  });
};

export default AcceptMoveModal;
