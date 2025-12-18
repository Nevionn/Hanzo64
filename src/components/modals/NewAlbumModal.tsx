import React, {useState} from 'react';
import {View, Text, Modal, StyleSheet, StatusBar} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {useAppSettings, setButtonColor} from '../../utils/settingsContext';
import {COLOR} from '../../shared/colorTheme';

interface NewAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (album: {title: string}) => void;
}

const NewAlbumModal: React.FC<NewAlbumModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const {appSettings} = useAppSettings();

  const [title, setTitle] = useState<string>('');
  const [focused, setFocused] = useState(false);

  const handleSave = () => {
    if (title) {
      onSubmit({title});
      setTitle('');
      onClose();
    }
  };

  const handleCloseModal = () => {
    onClose();
    setTitle('');
    setFocused(false);
  };

  const styles = getStyles(appSettings.darkMode);

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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            textColor={styles.inputTextColor.color}
            outlineColor={styles.inputViewOutlineColor.color}
            style={styles.inputView}
            theme={{
              colors: {
                onSurfaceVariant: focused
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
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleSave()}>
              Создать
            </Button>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={handleCloseModal}>
              Отмена
            </Button>
          </View>
        </View>
      </View>
    </Modal>
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
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    inputView: {
      marginBottom: 20,
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
};

export default NewAlbumModal;
