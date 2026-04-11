import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ModalText} from '../shared/textForModal';
import {COLOR} from '../shared/colorTheme';
import {TYPOGRAPHY} from '../shared/typography';

import {usePhotoRequest} from '../hooks/usePhotoRequest';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {useSettingsStore} from '../store/settings/useSettingsStore';

import SvgLeftArrow from './icons/SvgLeftArrow';
import SvgDotsVertical from './icons/SvgDotsVertical';
import {IconButton} from 'react-native-paper';
import SvgBidirectionalArrows from './icons/SvgBidirectionalArrows';

import AcceptMoveModal from './modals/AcceptMoveModal';
import RenameAlbumModal from './modals/RenameAlbumModal';

import eventEmitter from '../utils/eventEmitter';
import {pickImage} from '../utils/camera';
import {capturePhoto} from '../utils/camera';

interface NaviBarPhotoProps {
  titleAlbum: string;
  descriptionAlbum: string;
  idAlbum: string;
  sortPhotos: () => void;
  setUploadingPhotos: (value: boolean) => void;
}

const NavibarPhoto: React.FC<NaviBarPhotoProps> = ({
  titleAlbum,
  descriptionAlbum,
  idAlbum,
  sortPhotos,
  setUploadingPhotos,
}) => {
  const {deleteAlbum} = useAlbumsRequest();
  const {addPhoto, deleteAllPhotosCurrentAlbum} = usePhotoRequest();

  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);

  const navigation: any = useNavigation();
  const statusBarHeight: any = StatusBar.currentHeight;

  const [title, setTitile] = useState(titleAlbum);
  const [description, setDescription] = useState(descriptionAlbum);

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

  const updateTitleAlbum = (newTitle: string, newDescription: string) => {
    setTitile(newTitle), setDescription(newDescription);
  };

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

  const renderDescription = (text: string) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={styles.link}
            onPress={() => Linking.openURL(part)}>
            {part}
          </Text>
        );
      }

      return (
        <Text key={index} style={styles.descriptionText}>
          {part}
        </Text>
      );
    });
  };

  const styles = getStyles(darkModeFromStore);

  return (
    <>
      <View style={[styles.navibar, {top: statusBarHeight - 5}]}>
        <View style={styles.manipulationItem}>
          <IconButton
            icon={() => (
              <SvgLeftArrow
                color={darkModeFromStore ? COLOR.dark.ICON : COLOR.light.ICON}
              />
            )}
            size={30}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.rightItemContent}>
            <IconButton
              icon={() => (
                <SvgBidirectionalArrows
                  color={darkModeFromStore ? COLOR.dark.ICON : COLOR.light.ICON}
                />
              )}
              size={30}
              onPress={() => sortPhotos()}
            />
            <IconButton
              icon={() => (
                <SvgDotsVertical
                  color={darkModeFromStore ? COLOR.dark.ICON : COLOR.light.ICON}
                />
              )}
              size={30}
              onPress={toggleMiniModal}
            />
          </View>
        </View>

        <View style={styles.titleAlbumItem}>
          <Text style={styles.title}>{title}</Text>

          {!!description && (
            <Text style={styles.descriptionWrapper}>
              {renderDescription(description)}
            </Text>
          )}
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
                setModalAction('clear');
                handleOpenAcceptMoveModal();
                toggleMiniModal();
              }}>
              <Text style={styles.modalItem}>Очистить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalAction('delete');
                handleOpenAcceptMoveModal();
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
        description={descriptionAlbum}
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
      flexDirection: 'row',
    },
    titleAlbumItem: {
      flexDirection: 'column',
      width: '100%',
      paddingHorizontal: 24,
    },
    title: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      fontFamily: TYPOGRAPHY.generalFont,
      fontSize: 20,
      fontWeight: '500',
    },
    descriptionWrapper: {
      marginTop: 4,
      flexWrap: 'wrap',
    },
    descriptionText: {
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
      fontFamily: TYPOGRAPHY.generalFont,
      fontSize: 14,
      lineHeight: 18,
    },
    link: {
      color: '#a855f7',
      textDecorationLine: 'underline',
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
