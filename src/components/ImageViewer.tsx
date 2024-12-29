import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
import {IconButton} from 'react-native-paper';
import SvgDotsVertical from './icons/SvgDotsVertical';
import SvgLeftArrow from './icons/SvgLeftArrow';
import EditPhotoMiniModal from './modals/EditPhotoMiniModal';
import {COLOR} from '../../assets/colorTheme';

const {width, height} = Dimensions.get('window');
const INFOBAR_HEIGHT = 60;

interface PhotoItem {
  id: number;
  photo: string;
}

interface ImageViewerProps {
  visible: boolean;
  onCloseImgViewer: () => void;
  photos: PhotoItem[];
  initialIndex: number;
  idAlbum: number;
  idPhoto: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  onCloseImgViewer,
  photos,
  initialIndex,
  idAlbum,
  idPhoto,
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 1,
    height: 1,
  });
  const [isMiniModalVisible, setIsMiniModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentPhoto, setCurrentPhoto] = useState<PhotoItem | null>(
    photos[initialIndex] || null,
  );
  const flatListRef = useRef<FlatList>(null);

  const handleOpenMiniModal = () => setIsMiniModalVisible(true);
  const handleCloseMiniModal = () => setIsMiniModalVisible(false);

  useEffect(() => {
    const getSizeAndCalculateView = () => {
      if (currentPhoto?.photo) {
        Image.getSize(
          `data:image/jpeg;base64,${currentPhoto.photo}`,
          (imgWidth, imgHeight) => {
            console.log('Image dimensions:', imgWidth, imgHeight);

            // Вычисляем масштабирование
            const aspectRatio = imgWidth / imgHeight;
            const maxWidth = width;
            const maxHeight = height;
            const displayWidth = Math.min(maxWidth, maxHeight * aspectRatio);
            const displayHeight = Math.min(maxHeight, maxWidth / aspectRatio);

            setImageDimensions({
              width: displayWidth,
              height: displayHeight,
            });
          },
          error => {
            console.error('Ошибка при получении размеров изображения:', error);
          },
        );
      }
    };

    getSizeAndCalculateView();
  }, [currentPhoto]);

  // синхронизируем текущее фото с изменениями индекса
  useEffect(
    function changeIndexCarousel() {
      if (photos[currentIndex]) {
        setCurrentPhoto(photos[currentIndex]);
      }
    },
    [currentIndex, photos],
  );

  // запускаем компонент с выбраной фотографией
  useEffect(
    function openViewerAtIndex() {
      if (visible && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
        setCurrentIndex(initialIndex);
        setCurrentPhoto(photos[initialIndex]);
      }
    },
    [visible, initialIndex, photos],
  );

  const renderItem = ({item}: {item: PhotoItem}) => (
    <View style={styles.zoomableViewContainer}>
      <View style={styles.swipeZoneLeft} />
      <ReactNativeZoomableView
        maxZoom={2.5}
        minZoom={1}
        zoomStep={1}
        initialZoom={1}
        bindToBorders={true}
        disablePanOnInitialZoom={false}
        contentWidth={imageDimensions.width}
        contentHeight={imageDimensions.height}>
        <Image
          style={{width: width, height: height}}
          source={{
            uri: `data:image/jpeg;base64,${item.photo}`,
          }}
          resizeMode="contain"
        />
      </ReactNativeZoomableView>
      <View style={styles.swipeZoneRight} />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCloseImgViewer}>
      <StatusBar translucent backgroundColor="black" />
      <View style={styles.modalContainer}>
        <View style={styles.infoBar}>
          <IconButton
            icon={() => <SvgLeftArrow color={COLOR.SVG_WHITE} />}
            size={30}
            onPress={onCloseImgViewer}
          />
          <Text style={styles.infoText}>
            {`${currentIndex + 1} из ${photos.length}`}
          </Text>
          <IconButton
            icon={() => <SvgDotsVertical color={COLOR.SVG_WHITE} />}
            size={30}
            onPress={handleOpenMiniModal}
          />
        </View>

        {/* Карусель фотографий */}
        <FlatList
          ref={flatListRef}
          data={photos}
          horizontal
          windowSize={3}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 500);
          }}
        />
      </View>

      <EditPhotoMiniModal
        visible={isMiniModalVisible}
        onCloseEditModal={handleCloseMiniModal}
        onCloseImgViewer={onCloseImgViewer}
        idPhoto={currentPhoto?.id || idPhoto}
        idAlbum={idAlbum}
      />
    </Modal>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,1)',
    position: 'relative',
  },
  infoBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    zIndex: 10,
    height: INFOBAR_HEIGHT,
    width: '100%',
    backgroundColor: 'black',
  },
  infoText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  zoomableViewContainer: {
    flex: 1,
    marginTop: INFOBAR_HEIGHT,
    backgroundColor: 'black',
  },
  swipeZoneLeft: {
    position: 'absolute',
    left: 0,
    width: 50,
    height: '100%',
    zIndex: 10,
  },
  swipeZoneRight: {
    position: 'absolute',
    right: 0,
    width: 50,
    height: '100%',
    zIndex: 10,
  },
});
