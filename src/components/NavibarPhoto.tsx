import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SvgLeftArrow from './icons/SvgLeftArrow';
import SvgDotsVertical from './icons/SvgDotsVertical';
import NaviBarPhotoProps from '../types/NaviBarPhotoProps';
import {IconButton} from 'react-native-paper';
import AcceptMoveModal from './modals/AcceptMoveModal';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {ModalText} from '../../assets/textForModal';

const NavibarPhoto: React.FC<NaviBarPhotoProps> = ({titleAlbum, idAlbum}) => {
  const navigation: any = useNavigation();
  const statusBarHeight: any = StatusBar.currentHeight;

  const {} = useAlbumsRequest();

  const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
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
            {titleAlbum}
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
            <TouchableOpacity onPress={() => console.log('Добавить фото')}>
              <Text style={styles.modalItem}>Добавить фото</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Редактировать')}>
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
      <AcceptMoveModal
        visible={isAcceptMoveModalVisible}
        onClose={handleCloseAcceptMoveModal}
        title={ModalText.deleteAlbum.title}
        textBody={ModalText.deleteAlbum.textBody}
        idAlbum={idAlbum}
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
    // borderWidth: 1,
    // borderColor: 'red',
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
