import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
import NaviBar from '../components/Navibar';
import {useNavigation} from '@react-navigation/native';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {useSettingsRequest} from '../hooks/useSettingsRequest';
import useMediaInformation from '../hooks/useMediaInformation';
import {useAppSettings, setStatusBarTheme} from '../../assets/settingsContext';
import NewAlbumModal from '../components/modals/NewAlbumModal';
import SettingsModal from '../components/modals/SettingsModal';
import eventEmitter from '../../assets/eventEmitter';

interface Album {
  id: string;
  title: string;
  countPhoto: number;
  created_at: string;
  coverPhoto: string;
}

const MainPage: React.FC = () => {
  const navigation: any = useNavigation();

  const {addAlbum, getAllAlbums} = useAlbumsRequest();
  const {acceptSettings, getSettings} = useSettingsRequest();
  const {appSettings, saveAppSettings} = useAppSettings();
  const {calcAllAlbums, calcAllPhotos} = useMediaInformation();

  const [isModalAddAlbumVisible, setModalAddAlbumVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [fetchingAlbums, setFetchingAlbums] = useState(false);

  const [photoCount, setPhotoCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);

  useEffect(() => {
    getSettings(saveAppSettings);
  }, [appSettings.darkMode]);

  useEffect(() => {
    const updateAlbums = () => {
      setFetchingAlbums(true);

      getAllAlbums((fetchedAlbums: Album[]) => {
        setAlbums(fetchedAlbums);
        setFetchingAlbums(false);
      }, appSettings.sortOrder);
    };

    updateAlbums();

    eventEmitter.on('albumsUpdated', updateAlbums);
    return () => {
      eventEmitter.off('albumsUpdated', updateAlbums);
    };
  }, [appSettings.sortOrder]);

  useEffect(() => {
    const fetchPhotoAndAlbumCount = async () => {
      try {
        const [albums, photos] = await Promise.all([
          calcAllAlbums(),
          calcAllPhotos(),
        ]);
        setAlbumCount(albums);
        setPhotoCount(photos);
      } catch (error) {
        console.error(
          'Ошибка при получении количества альбомов и фотографий:',
          error,
        );
      }
    };

    eventEmitter.on('albumsUpdated', fetchPhotoAndAlbumCount);
    eventEmitter.on('photosUpdated', fetchPhotoAndAlbumCount);

    fetchPhotoAndAlbumCount();

    return () => {
      eventEmitter.off('albumsUpdated', fetchPhotoAndAlbumCount);
      eventEmitter.off('photosUpdated', fetchPhotoAndAlbumCount);
    };
  }, []);

  const openSettings = () => setIsSettingsModalVisible(true);

  const saveSettings = (newSettings: typeof appSettings) => {
    saveAppSettings(newSettings);
    console.log('Настройки сохранены:', newSettings);
    acceptSettings(newSettings);
  };

  const openCreateAlbumModal = () => setModalAddAlbumVisible(true);

  const handleAddAlbum = (newAlbum: {title: string}) => {
    const currentDate = new Date();

    const albumToInsert = {
      title: newAlbum.title,
      countPhoto: 0,
      created_at: currentDate.toLocaleString(),
    };
    addAlbum(albumToInsert), getAllAlbums(setAlbums, appSettings.sortOrder);
    eventEmitter.emit('albumsUpdated');
  };

  const openAlbum = (album: Album) => {
    navigation.navigate('PhotoPage', {album});
  };

  const styles = getStyles(appSettings.darkMode);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={setStatusBarTheme(appSettings.darkMode)}
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.topSpacer} />

      <View style={styles.countItem}>
        {albums.length > 0 && (
          <Text style={styles.textDim}>
            Альбомов: {albumCount} {'\u00A0\u00A0\u00A0'} фотографий:{' '}
            {photoCount}
          </Text>
        )}
      </View>

      {fetchingAlbums ? (
        <ActivityIndicator size="large" color={COLOR.LOAD} style={{flex: 1}} />
      ) : (
        <FlatList
          data={albums}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.placeHolder}
              onPress={() => openAlbum(item)}>
              <View style={styles.imagePlace}>
                {item.coverPhoto ? (
                  <Image
                    source={{uri: `data:image/jpeg;base64,${item.coverPhoto}`}}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/not_img_default.png')}
                    style={styles.image}
                  />
                )}
              </View>
              <View style={styles.textImageHolder}>
                <Text style={styles.textNameAlbum}>
                  {item.title.length > 12
                    ? `${item.title.substring(0, 20)}...`
                    : item.title}
                </Text>
                <Text
                  style={
                    styles.textCountPhoto
                  }>{`фотографий ${item.countPhoto}`}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={
            albums.length === 0 ? {flex: 1, justifyContent: 'center'} : null
          }
          ListFooterComponent={<View style={styles.stab} />}
          ListEmptyComponent={
            <View style={styles.emptyDataItem}>
              <Text style={styles.text}>Альбомов нет</Text>
            </View>
          }
        />
      )}
      <NewAlbumModal
        visible={isModalAddAlbumVisible}
        onClose={() => setModalAddAlbumVisible(false)}
        onSubmit={handleAddAlbum}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onSave={saveSettings}
        albumsExist={albums.length > 0}
      />
      <NaviBar
        openModalAlbum={openCreateAlbumModal}
        openModalSettings={openSettings}
      />
    </SafeAreaView>
  );
};
export default MainPage;

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    root: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: darkMode
        ? COLOR.dark.MAIN_COLOR
        : COLOR.light.MAIN_COLOR,
    },
    topSpacer: {
      height: '15%',
    },
    countItem: {
      height: 24,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeHolder: {
      flexBasis: '45%',
      margin: 10,
      height: 220,
      borderRadius: 10,
    },
    imagePlace: {
      flex: 1,
      width: '100%',
      borderWidth: 0.5,
      borderColor: 'white',
      borderRadius: 10,
    },
    image: {
      height: '100%',
      width: '100%',
      borderRadius: 10,
    },
    textImageHolder: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingLeft: 2,
      height: 40,
      width: '100%',
      zIndex: 10,
    },
    textNameAlbum: {
      fontSize: 14,
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    textCountPhoto: {
      fontSize: 12,
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
    emptyDataItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    stab: {
      flex: 1,
      height: 50,
    },
    text: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    textDim: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
  });
};
