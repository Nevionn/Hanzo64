import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {usePhotoRequest} from '../hooks/usePhotoRequest';
import eventEmitter from '../../assets/eventEmitter';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import SvgLeftArrow from './icons/SvgLeftArrow';
import SvgDotsVertical from './icons/SvgDotsVertical';
import {IconButton} from 'react-native-paper';
import {ModalText} from '../../assets/textForModal';
import {launchImageLibrary} from 'react-native-image-picker';
import NaviBarPhotoProps from '../types/NaviBarPhotoProps';
import AcceptMoveModal from './modals/AcceptMoveModal';
import RenameAlbumModal from './modals/RenameAlbumModal';

const NavibarPhoto: React.FC<NaviBarPhotoProps> = ({titleAlbum, idAlbum}) => {
  const {deleteAlbum} = useAlbumsRequest();
  const {addPhoto, deleteAllPhotosCurrentAlbum} = usePhotoRequest();

  const navigation: any = useNavigation();
  const statusBarHeight: any = StatusBar.currentHeight;

  const [title, setTitile] = useState(titleAlbum);

  const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
  const [isRenameAlbumModal, setIsRenameAlbumModal] = useState(false);
  const [isAcceptMoveModalVisible, setIsAcceptMoveModalVisible] =
    useState(false);

  const toggleMiniModal = () => {
    setIsMiniModalVisible(!isMiniModalVisible);
  };

  const handleOpenAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(true);
  };

  const handleCloseAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(false);
  };

  const handleOpenRenameAlbumModal = () => {
    setIsRenameAlbumModal(true);
  };

  const handleCloseRenameAlbumModal = () => {
    setIsRenameAlbumModal(false);
  };

  const updateTitleAlbum = (newTitle: string) => {
    setTitile(newTitle);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets && result.assets.length > 0) {
      const {base64, uri, fileName} = result.assets[0];
      console.log(result);

      if (base64) {
        try {
          addPhoto({
            album_id: idAlbum,
            title: fileName,
            photo: base64,
            created_at: new Date().toLocaleString(),
          });
          eventEmitter.emit('photosUpdated');
          eventEmitter.emit('albumsUpdated');
        } catch (error) {
          console.error('Ошибка при загрузке изображения:', error);
        }
      }
    }
  };

  const deleteAlbumExpand = () => {
    deleteAllPhotosCurrentAlbum(idAlbum);
    deleteAlbum(idAlbum);
    handleCloseAcceptMoveModal();
    eventEmitter.emit('albumsUpdated');
    navigation.goBack();
  };

  return (
    <>
      <View style={[styles.navibar, {top: statusBarHeight - 5}]}>
        <View style={styles.manipulationItem}>
          <IconButton
            icon={() => <SvgLeftArrow />}
            size={30}
            onPress={() => navigation.goBack()}
          />
          <IconButton
            icon={() => <SvgDotsVertical />}
            size={30}
            onPress={toggleMiniModal}
          />
        </View>
        <View style={styles.titleAlbumItem}>
          <Text style={styles.title}>
            {title}
            {'  '}
            {idAlbum}
          </Text>
        </View>
      </View>

      <Modal
        visible={isMiniModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleMiniModal}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMiniModal} // Закрытие модалки при нажатии вне
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                pickImage(), toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Добавить фото</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleOpenRenameAlbumModal(), toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleOpenAcceptMoveModal(), toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Удалить</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <RenameAlbumModal
        visible={isRenameAlbumModal}
        onClose={handleCloseRenameAlbumModal}
        onSubmit={updateTitleAlbum}
        title={titleAlbum}
        idAlbum={idAlbum}
      />
      <AcceptMoveModal
        visible={isAcceptMoveModalVisible}
        onCloseAcceptModal={handleCloseAcceptMoveModal}
        onConfirm={deleteAlbumExpand}
        title={ModalText.deleteAlbum.title}
        textBody={ModalText.deleteAlbum.textBody}
      />
    </>
  );
};

const styles = StyleSheet.create({
  navibar: {
    flexDirection: 'column',
    marginTop: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    width: '100%',
    zIndex: 10,
  },
  manipulationItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    width: '100%',
    height: '60%',
    backgroundColor: 'transparent',
  },
  titleAlbumItem: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    height: '40%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'medium',
    marginLeft: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    right: 10,
    top: 50, // Здесь задается примерная позиция
  },
  modalItem: {
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
});

export default NavibarPhoto;
