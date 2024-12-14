import React, {useState} from 'react';
import {View, Text, TextInput, Modal, StyleSheet} from 'react-native';
import {useAppSettings, setButtonColor} from '../../../assets/settingsContext';
import {Button} from 'react-native-paper';
import {COLOR} from '../../../assets/colorTheme';

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
  };

  const styles = getStyles(appSettings.darkMode);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Создать новый альбом</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={
              appSettings.darkMode ? '#ccc' : COLOR.light.TEXT_DIM
            }
            placeholder="Название альбома"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleSave()}>
              Сохранить
            </Button>
            <Button
              mode="contained"
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleCloseModal()}>
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
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#ccc' : 'black',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      padding: 10,
      borderRadius: 5,
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  });
};

export default NewAlbumModal;
