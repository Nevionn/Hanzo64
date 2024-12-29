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
import {useAppSettings, setSvgIconColor} from '../../assets/settingsContext';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import eventEmitter from '../../assets/eventEmitter';
import SvgLeftArrow from './icons/SvgLeftArrow';
import SvgDotsVertical from './icons/SvgDotsVertical';
import {IconButton} from 'react-native-paper';
import SvgBidirectionalArrows from './icons/SvgBidirectionalArrows';
import {ModalText} from '../../assets/textForModal';
import NaviBarPhotoProps from '../types/NaviBarPhotoProps';
import AcceptMoveModal from './modals/AcceptMoveModal';
import RenameAlbumModal from './modals/RenameAlbumModal';
import {COLOR} from '../../assets/colorTheme';
import {pickImage} from '../../assets/camera';
import {capturePhoto} from '../../assets/camera';

const NavibarPhoto: React.FC<NaviBarPhotoProps> = ({
  titleAlbum,
  idAlbum,
  sortPhotos,
}) => {
  const {deleteAlbum} = useAlbumsRequest();
  const {appSettings} = useAppSettings();
  const {addPhoto, deleteAllPhotosCurrentAlbum} = usePhotoRequest();

  const navigation: any = useNavigation();
  const statusBarHeight: any = StatusBar.currentHeight;

  const [title, setTitile] = useState(titleAlbum);

  const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
  const [isRenameAlbumModal, setIsRenameAlbumModal] = useState(false);
  const [isAcceptMoveModalVisible, setIsAcceptMoveModalVisible] =
    useState(false);

  const toggleMiniModal = () => setIsMiniModalVisible(!isMiniModalVisible);

  const handleOpenAcceptMoveModal = () => setIsAcceptMoveModalVisible(true);

  const handleCloseAcceptMoveModal = () => setIsAcceptMoveModalVisible(false);

  const handleOpenRenameAlbumModal = () => setIsRenameAlbumModal(true);

  const handleCloseRenameAlbumModal = () => setIsRenameAlbumModal(false);

  const updateTitleAlbum = (newTitle: string) => setTitile(newTitle);

  const deleteAlbumExpand = () => {
    deleteAllPhotosCurrentAlbum(idAlbum);
    deleteAlbum(idAlbum);
    handleCloseAcceptMoveModal();
    eventEmitter.emit('albumsUpdated');
    navigation.goBack();
  };

  const styles = getStyles(appSettings.darkMode);

  return (
    <>
      <View style={[styles.navibar, {top: statusBarHeight - 5}]}>
        <View style={styles.manipulationItem}>
          <IconButton
            icon={() => (
              <SvgLeftArrow color={setSvgIconColor(appSettings.darkMode)} />
            )}
            size={30}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.rightItemContent}>
            <IconButton
              icon={() => (
                <SvgBidirectionalArrows
                  color={setSvgIconColor(appSettings.darkMode)}
                />
              )}
              size={30}
              onPress={() => sortPhotos()}
            />
            <IconButton
              icon={() => (
                <SvgDotsVertical
                  color={setSvgIconColor(appSettings.darkMode)}
                />
              )}
              size={30}
              onPress={toggleMiniModal}
            />
          </View>
        </View>
        <View style={styles.titleAlbumItem}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <Modal
        visible={isMiniModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleMiniModal}>
        <StatusBar translucent backgroundColor="black" />
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMiniModal} // Закрытие модалки при нажатии вне
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                pickImage(idAlbum, addPhoto);
                toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Добавить фото</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                capturePhoto(idAlbum, addPhoto);
                toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Сделать фото</Text>
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

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
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
      width: '100%',
      height: '60%',
    },
    rightItemContent: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
    },
    titleAlbumItem: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      height: '40%',
      width: '100%',
    },
    title: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
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
      top: 50,
    },
    modalItem: {
      padding: 10,
      fontSize: 16,
      color: 'black',
    },
  });
};

export default NavibarPhoto;
