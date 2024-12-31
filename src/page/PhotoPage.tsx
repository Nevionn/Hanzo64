import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import {usePhotoRequest} from '../hooks/usePhotoRequest';
import {useAppSettings, setStatusBarTheme} from '../../assets/settingsContext';
import {COLOR} from '../../assets/colorTheme';
import eventEmitter from '../../assets/eventEmitter';
import {useRoute} from '@react-navigation/native';
import NavibarPhoto from '../components/NavibarPhoto';
import ImageViewer from '../components/ImageViewer';

interface PhotoObjectArray {
  id: number;
  album_id: number;
  title: string;
  photo: string;
  created_at: string;
}

const PhotoPage = () => {
  const {appSettings} = useAppSettings();
  const {getPhoto} = usePhotoRequest();
  const route: any = useRoute();
  const dataAlbum = route?.params;

  const [isVisibleImageViewer, setIsVisibleImageViewer] = useState(false);
  const [photos, setPhotos] = useState<PhotoObjectArray[]>([]);

  const [initialIndex, setInitialIndex] = useState(0);
  const [idAlbum, setIdAlbum] = useState(0);
  const [idPhoto, setIdPhoto] = useState(0);

  const openImageViewer = (index: number, id: number) => {
    setInitialIndex(index); // индекс элемента массива
    setIdPhoto(id); // порядковый номер фото в таблице
    setIdAlbum(dataAlbum.album.id);
    setIsVisibleImageViewer(true);
  };

  const closeImageViewer = () => {
    setIsVisibleImageViewer(false);
  };

  const reversePhotosSort = () => {
    setPhotos(prevPhotos => [...prevPhotos].reverse());
  };

  useEffect(() => {
    const updatePhotos = () => {
      getPhoto(dataAlbum.album.id, setPhotos);
    };

    updatePhotos();
    eventEmitter.on('photosUpdated', updatePhotos);

    return () => {
      eventEmitter.off('photosUpdated', updatePhotos);
    };
  }, []);

  const styles = getStyles(appSettings.darkMode);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={setStatusBarTheme(appSettings.darkMode)}
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.topSpacer} />
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={item => item.id.toString()}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={styles.placeHolder}
              onPress={() => openImageViewer(index, item.id)}>
              <Image
                source={{uri: `data:image/jpeg;base64,${item.photo}`}}
                style={styles.image}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyDataItem}>
          <Text style={styles.text}>Фотографий нет</Text>
        </View>
      )}
      <NavibarPhoto
        titleAlbum={dataAlbum.album.title}
        idAlbum={dataAlbum.album.id}
        sortPhotos={reversePhotosSort}
      />
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

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    root: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 62,
      backgroundColor: darkMode
        ? COLOR.dark.MAIN_COLOR
        : COLOR.light.MAIN_COLOR,
    },
    topSpacer: {
      height: '19%',
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
  });
};

export default PhotoPage;
