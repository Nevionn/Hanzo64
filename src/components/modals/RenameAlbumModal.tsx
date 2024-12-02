import React, {useState} from 'react';
import {View, Text, TextInput, Modal, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import {COLOR} from '../../../assets/colorTheme';
import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import eventEmitter from '../../../assets/eventEmitter';

interface RenameAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newTitile: string) => void;
  title: string;
  idAlbum: string;
}

const RenameAlbumModal: React.FC<RenameAlbumModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  idAlbum,
}) => {
  const {renameAlbum} = useAlbumsRequest();

  const [titleAlbum, setTitleAlbum] = useState<string>(title);

  const handleSave = () => {
    if (title) {
      renameAlbum(idAlbum, titleAlbum);
      setTitleAlbum('');
      eventEmitter.emit('albumsUpdated');
      onSubmit(titleAlbum);
      onClose();
    }
  };

  const handleCloseModal = () => {
    onClose();
    setTitleAlbum(title);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Переименовать альбом</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#ccc'}
            placeholder=""
            value={titleAlbum}
            onChangeText={setTitleAlbum}
          />
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={() => handleSave()}>
              Сохранить
            </Button>
            <Button mode="contained" onPress={() => handleCloseModal()}>
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
    backgroundColor: COLOR.dark.SECONDARY_COLOR,
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

export default RenameAlbumModal;
