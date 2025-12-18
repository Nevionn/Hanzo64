import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {usePhotoRequest} from '../../hooks/usePhotoRequest';
import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import eventEmitter from '../../utils/eventEmitter';
import AcceptMoveModal from './AcceptMoveModal';
import {ModalText} from '../../shared/textForModal';

interface EditPhotoMiniModalProps {
  visible: boolean;
  idPhoto: number;
  idAlbum: number;
  onCloseEditModal: () => void;
  onCloseImgViewer: () => void;
}

const EditPhotoMiniModal: React.FC<EditPhotoMiniModalProps> = ({
  visible,
  onCloseEditModal,
  onCloseImgViewer,
  idPhoto,
  idAlbum,
}) => {
  const {deletePhoto} = usePhotoRequest();
  const {setAlbumCover} = useAlbumsRequest();

  const [isAcceptMoveModalVisible, setIsAcceptMoveModalVisible] =
    useState(false);

  const handleOpenAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(true);
  };
  const handleCloseAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(false);
  };

  const deletePhotoExpand = () => {
    deletePhoto(idAlbum, idPhoto);
    handleCloseAcceptMoveModal();
    onCloseImgViewer();
    eventEmitter.emit('photosUpdated');
    eventEmitter.emit('albumsUpdated');
  };

  const setAlbumCoverExpand = () => {
    setAlbumCover(idAlbum, idPhoto);
    onCloseEditModal();
    eventEmitter.emit('albumsUpdated');
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onCloseEditModal()}>
        <StatusBar translucent backgroundColor="black" />
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
            <TouchableOpacity onPress={() => setAlbumCoverExpand()}>
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
