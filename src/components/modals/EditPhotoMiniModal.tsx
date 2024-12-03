import React, {useState} from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {usePhotoRequest} from '../../hooks/usePhotoRequest';
import eventEmitter from '../../../assets/eventEmitter';
import AcceptMoveModal from './AcceptMoveModal';
import {ModalText} from '../../../assets/textForModal';

interface EditPhotoMiniModalProps {
  visible: boolean;
  onCloseEditModal: () => void;
  onCloseImgViewer: () => void;
  idPhoto: number;
  idAlbum: number;
}

const EditPhotoMiniModal: React.FC<EditPhotoMiniModalProps> = ({
  visible,
  onCloseEditModal,
  onCloseImgViewer,
  idPhoto,
  idAlbum,
}) => {
  const {deletePhoto} = usePhotoRequest();

  const [isAcceptMoveModalVisible, setIsAcceptMoveModalVisible] =
    useState(false);

  const handleOpenAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(true);
  };
  const handleCloseAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(false);
  };

  const deletePhotoExpand = () => {
    deletePhoto(idAlbum, idPhoto); // дописать метод (понизить счетчик фотографий - 1) !
    handleCloseAcceptMoveModal();
    onCloseImgViewer();
    eventEmitter.emit('photosUpdated');
    eventEmitter.emit('albumsUpdated');
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onCloseEditModal()}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => onCloseEditModal()}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                handleOpenAcceptMoveModal(), onCloseEditModal();
              }}>
              <Text style={styles.modalItem}>Удалить</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.modalItem}>Сделать обложкой</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <AcceptMoveModal
        visible={isAcceptMoveModalVisible}
        onCloseAcceptModal={() => handleCloseAcceptMoveModal()}
        onConfirm={deletePhotoExpand}
        title={ModalText.deletePhoto.title}
        textBody={ModalText.deletePhoto.textBody}
      />
    </>
  );
};

export default EditPhotoMiniModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    position: 'absolute',
    right: 10,
    top: 50,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  modalItem: {
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
});
