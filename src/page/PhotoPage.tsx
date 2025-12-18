import React, {useState, useEffect, useCallback} from 'react';
import {
  StatusBar,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {useAnimatedRef} from 'react-native-reanimated';
import {usePhotoRequest} from '../hooks/usePhotoRequest';
import {useAppSettings, setStatusBarTheme} from '../utils/settingsContext';
import {useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import eventEmitter from '../utils/eventEmitter';

import {COLOR} from '../shared/colorTheme';

import Sortable from 'react-native-sortables';
import NavibarPhoto from '../components/NavibarPhoto';
import ImageViewer from '../components/ImageViewer';
import UploadingIndicator from '../components/UploadingIndicator';

interface PhotoObjectArray {
  id: number;
  album_id: number;
  title: string;
  photo: string;
  created_at: string;
}

const PhotoPage = () => {
  const {appSettings} = useAppSettings();
  const {getPhoto, savePhotosOrder} = usePhotoRequest();
  const route: any = useRoute();
  const dataAlbum = route?.params;

  const insets = useSafeAreaInsets();

  const [photos, setPhotos] = useState<PhotoObjectArray[]>([]);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [isVisibleImageViewer, setIsVisibleImageViewer] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [idAlbum, setIdAlbum] = useState(0);
  const [idPhoto, setIdPhoto] = useState(0);

  const styles = getStyles(appSettings.darkMode);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const openImageViewer = (index: number, id: number) => {
    setInitialIndex(index);
    setIdPhoto(id);
    setIdAlbum(dataAlbum.album.id);
    setIsVisibleImageViewer(true);
  };

  const closeImageViewer = () => setIsVisibleImageViewer(false);

  const reversePhotosSort = () => {
    setPhotos(prev => [...prev].reverse());
  };

  useEffect(() => {
    if (!dataAlbum?.album?.id) return;

    const updatePhotos = () => {
      setFetchingPhotos(true);
      getPhoto(dataAlbum.album.id, (fetchedPhotos: PhotoObjectArray[]) => {
        setPhotos(fetchedPhotos);
        setFetchingPhotos(false);
        setUploadingPhotos(false);
      });
    };

    updatePhotos();
    eventEmitter.on('photosUpdated', updatePhotos);

    return () => {
      eventEmitter.off('photosUpdated', updatePhotos);
    };
  }, [dataAlbum?.album?.id]);

  const handleOrderChange = useCallback(
    ({fromIndex, toIndex}: {fromIndex: number; toIndex: number}) => {
      setPhotos(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        // сохраняем порядок в БД
        savePhotosOrder(updated);

        return updated;
      });
    },
    [savePhotosOrder],
  );

  const renderPhotoItem = useCallback(
    ({item, index}: {item: PhotoObjectArray; index: number}) => (
      <TouchableOpacity
        onPress={() => openImageViewer(index, item.id)}
        style={styles.placeHolder}>
        <Image
          source={{uri: `data:image/jpeg;base64,${item.photo}`}}
          style={styles.image}
        />
      </TouchableOpacity>
    ),
    [openImageViewer, styles],
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={setStatusBarTheme(appSettings.darkMode)}
        translucent
        backgroundColor="transparent"
      />
      <NavibarPhoto
        titleAlbum={dataAlbum.album.title}
        idAlbum={dataAlbum.album.id}
        sortPhotos={reversePhotosSort}
        setUploadingPhotos={setUploadingPhotos}
      />

      <View style={styles.topSpacer} />

      {uploadingPhotos && (
        <UploadingIndicator uploadingPhotos={uploadingPhotos} />
      )}

      {!fetchingPhotos && photos.length === 0 && (
        <View style={styles.emptyDataItem}>
          <Text style={styles.text}>Тут пусто</Text>
        </View>
      )}

      {fetchingPhotos ? (
        <View style={styles.loadingItem}>
          <ActivityIndicator
            size="large"
            color={COLOR.LOAD}
            style={styles.loader}
          />
          <Text style={styles.text}>Чтение данных</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{paddingBottom: insets.bottom + 20}}
          showsVerticalScrollIndicator={false}>
          <Sortable.Grid
            data={photos}
            columns={3}
            rowGap={2}
            columnGap={2}
            strategy={'insert'}
            scrollableRef={scrollRef}
            autoScrollEnabled={true}
            autoScrollActivationOffset={80}
            showDropIndicator
            dropIndicatorStyle={styles.dropIndicator}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPhotoItem}
            onOrderChange={handleOrderChange}
          />
        </ScrollView>
      )}

      <ImageViewer
        visible={isVisibleImageViewer}
        onCloseImgViewer={closeImageViewer}
        photos={photos}
        initialIndex={initialIndex}
        idAlbum={idAlbum}
        idPhoto={idPhoto}
      />
    </SafeAreaView>
  );
};

export default PhotoPage;

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: darkMode
        ? COLOR.dark.MAIN_COLOR
        : COLOR.light.MAIN_COLOR,
    },
    dropIndicator: {
      backgroundColor: 'rgba(54, 135, 127, 0.5)',
      borderColor: '#36877f',
      borderStyle: 'solid',
      borderWidth: 5,
    },
    topSpacer: {
      height: '5%',
    },
    placeHolder: {
      margin: 2,
      height: 120,
      width: Dimensions.get('window').width / 3 - 4, // 3 элемента в ряд
      aspectRatio: 1, // Квадрат
    },
    image: {
      height: '100%',
      width: '100%',
      borderRadius: 10,
    },
    emptyDataItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      marginRight: 20,
    },
    loader: {
      marginHorizontal: 10,
    },
    text: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
  });
};
