import React, {useState} from 'react';
import {View, Text, Modal, StyleSheet, StatusBar} from 'react-native';
import {TextInput, Button} from 'react-native-paper';

import {COLOR} from '../../shared/colorTheme';
import {TYPOGRAPHY} from '../../shared/typography';

import {useSettingsStore} from '../../store/settings/useSettingsStore';

interface NewAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (album: {title: string; description?: string}) => void;
}

const NewAlbumModal: React.FC<NewAlbumModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [focusedTitle, setFocusedTitle] = useState(false);
  const [focusedDesc, setFocusedDesc] = useState(false);

  const resetStatesInput = () => {
    setTitle('');
    setDescription('');
    setFocusedTitle(false);
    setFocusedDesc(false);
  };

  const handleSave = () => {
    if (title) {
      onSubmit({title, description});
      onClose();
      resetStatesInput();
    }
  };

  const handleCloseModal = () => {
    onClose();
    resetStatesInput();
  };

  const styles = getStyles(darkModeFromStore);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}>
      <StatusBar translucent backgroundColor="black" />
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Создать новый альбом</Text>

          <TextInput
            mode="outlined"
            label="Название альбома"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedTitle(true)}
            onBlur={() => setFocusedTitle(false)}
            textColor={styles.inputTextColor.color}
            outlineColor={styles.inputViewOutlineColor.color}
            style={styles.inputView}
            theme={{
              colors: {
                onSurfaceVariant: focusedTitle
                  ? styles.inputTextColor.color
                  : '#8e8e8e',
                primary: styles.inputTextColor.color,
              },
            }}
          />

          <TextInput
            mode="outlined"
            label="Описание альбома"
            value={description}
            onChangeText={setDescription}
            onFocus={() => setFocusedDesc(true)}
            onBlur={() => setFocusedDesc(false)}
            textColor={styles.inputTextColor.color}
            outlineColor={styles.inputViewOutlineColor.color}
            style={styles.inputView}
            multiline
            numberOfLines={3}
            theme={{
              colors: {
                onSurfaceVariant: focusedDesc
                  ? styles.inputTextColor.color
                  : '#8e8e8e',
                primary: styles.inputTextColor.color,
              },
            }}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={
                darkModeFromStore
                  ? COLOR.dark.BUTTON_COLOR
                  : COLOR.light.BUTTON_COLOR
              }
              onPress={handleSave}>
              Создать
            </Button>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={
                darkModeFromStore
                  ? COLOR.dark.BUTTON_COLOR
                  : COLOR.light.BUTTON_COLOR
              }
              onPress={handleCloseModal}>
              Отмена
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '80%',
      padding: 20,
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontFamily: TYPOGRAPHY.generalFont,
      marginBottom: 20,
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    inputView: {
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
    },
    inputViewOutlineColor: {
      color: darkMode ? '#999' : '#555',
    },
    inputTextColor: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  });

export default NewAlbumModal;
