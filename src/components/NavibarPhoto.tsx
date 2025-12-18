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
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';

import SvgLeftArrow from './icons/SvgLeftArrow';
import SvgDotsVertical from './icons/SvgDotsVertical';
import {IconButton} from 'react-native-paper';
import SvgBidirectionalArrows from './icons/SvgBidirectionalArrows';

import AcceptMoveModal from './modals/AcceptMoveModal';
import RenameAlbumModal from './modals/RenameAlbumModal';

import {useAppSettings, setSvgIconColor} from '../utils/settingsContext';
import eventEmitter from '../utils/eventEmitter';
import {ModalText} from '../shared/textForModal';
import {COLOR} from '../shared/colorTheme';
import {pickImage} from '../utils/camera';
import {capturePhoto} from '../utils/camera';

interface NaviBarPhotoProps {
  titleAlbum: string;
  idAlbum: string;
  sortPhotos: () => void;
  setUploadingPhotos: (value: boolean) => void;
}

const NavibarPhoto: React.FC<NaviBarPhotoProps> = ({
  titleAlbum,
  idAlbum,
  sortPhotos,
  setUploadingPhotos,
}) => {
  const {deleteAlbum} = useAlbumsRequest();
  const {appSettings} = useAppSettings();
  const {addPhoto, deleteAllPhotosCurrentAlbum} = usePhotoRequest();

  const navigation: any = useNavigation();
  const statusBarHeight: any = StatusBar.currentHeight;

  const [title, setTitile] = useState(titleAlbum);

  const [modalAction, setModalAction] = useState<'clear' | 'delete' | null>(
    null,
  );

  const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
  const [isRenameAlbumModal, setIsRenameAlbumModal] = useState(false);
  const [isAcceptMoveModalVisible, setIsAcceptMoveModalVisible] =
    useState(false);

  const toggleMiniModal = () => setIsMiniModalVisible(!isMiniModalVisible);

  const handleOpenAcceptMoveModal = () => setIsAcceptMoveModalVisible(true);

  const handleCloseAcceptMoveModal = () => {
    setIsAcceptMoveModalVisible(false), setModalAction(null);
  };

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

  const clearAlbumExpand = () => {
    deleteAllPhotosCurrentAlbum(idAlbum);
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
        <TouchableOpacity style={styles.overlay} onPress={toggleMiniModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setUploadingPhotos(true);
                pickImage(idAlbum, addPhoto, setUploadingPhotos);
                toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Добавить фото</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setUploadingPhotos(true);
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
                setModalAction('clear'),
                  handleOpenAcceptMoveModal(),
                  toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Очистить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalAction('delete'),
                  handleOpenAcceptMoveModal(),
                  toggleMiniModal();
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
        onConfirm={
          modalAction === 'delete' ? deleteAlbumExpand : clearAlbumExpand
        }
        title={
          modalAction === 'delete'
            ? ModalText.deleteAlbum.title
            : ModalText.clearAlbum.title
        }
        textBody={
          modalAction === 'delete'
            ? ModalText.deleteAlbum.textBody
            : ModalText.clearAlbum.textBody
        }
      />
    </>
  );
};

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    navibar: {
      flexDirection: 'column',
      zIndex: 10,
    },
    manipulationItem: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
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
