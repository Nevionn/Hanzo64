import React, {useState} from 'react';
import {View, Text, TextInput, Modal, StyleSheet} from 'react-native';
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
  const [title, setTitle] = useState<string>('');

  const handleSave = () => {
    if (title) {
      onSubmit({title});
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Создать новый альбом</Text>
          <TextInput
            style={styles.input}
            placeholder="Название альбома"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleSave}>
              Сохранить
            </Button>
            <Button mode="contained" onPress={onClose}>
              Отмена
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: COLOR.SECONDARY_COLOR,
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
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default NewAlbumModal;
