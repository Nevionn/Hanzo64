import React, {useState, useEffect, useCallback} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {useAnimatedRef} from 'react-native-reanimated';
import Sortable from 'react-native-sortables';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import NaviBar from '../components/Navibar';
import AlbumSearchBar from '../components/AlbumSearchBar';
import CounterMediaData from '../components/CounterMediaData';
import NewAlbumModal from '../components/modals/NewAlbumModal';
import SettingsModal from '../components/modals/SettingsModal';

import {COLOR} from '../shared/colorTheme';

import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {useSettingsRequest} from '../hooks/useSettingsRequest';
import useMediaInformation from '../hooks/useMediaInformation';
import {useAppSettings, setStatusBarTheme} from '../utils/settingsContext';
import eventEmitter from '../utils/eventEmitter';

interface Album {
  id: string;
  title: string;
  countPhoto: number;
  created_at: string;
  coverPhoto: string;
}

const MainPage: React.FC = () => {
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();

  const {addAlbum, getAllAlbums, saveAlbumsOrder} = useAlbumsRequest();
  const {acceptSettings, getSettings} = useSettingsRequest();
  const {appSettings, saveAppSettings} = useAppSettings();
  const {calcAllAlbums, calcAllPhotos} = useMediaInformation();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [fetchingAlbums, setFetchingAlbums] = useState(false);
  const [albumCount, setAlbumCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');

  const [isModalAddAlbumVisible, setModalAddAlbumVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const styles = getStyles(appSettings.darkMode);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useEffect(() => {
    getSettings(saveAppSettings);
  }, [appSettings.darkMode]);

  useEffect(() => {
    const updateAlbums = () => {
      setFetchingAlbums(true);
      getAllAlbums((fetchedAlbums: Album[]) => {
        setAlbums(fetchedAlbums);
        setFetchingAlbums(false);
      });
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
        const [albumsCount, photosCount] = await Promise.all([
          calcAllAlbums(),
          calcAllPhotos(),
        ]);
        setAlbumCount(albumsCount);
        setPhotoCount(photosCount);
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
  const openCreateAlbumModal = () => setModalAddAlbumVisible(true);

  const saveSettings = (newSettings: typeof appSettings) => {
    saveAppSettings(newSettings);
    acceptSettings(newSettings);
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddAlbum = (newAlbum: {title: string}) => {
    const currentDate = new Date();
    const albumToInsert = {
      title: newAlbum.title,
      countPhoto: 0,
      created_at: currentDate.toLocaleString(),
    };
    addAlbum(albumToInsert);
    getAllAlbums(setAlbums);
    eventEmitter.emit('albumsUpdated');
  };

  const openAlbum = (album: Album) => {
    navigation.navigate('PhotoPage', {album});
  };

  const handleOrderChange = useCallback(
    ({fromIndex, toIndex}: {fromIndex: number; toIndex: number}) => {
      setAlbums(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        // сохраняем новый порядок в БД
        saveAlbumsOrder(updated);

        return updated;
      });
    },
    [saveAlbumsOrder],
  );

  const isReorderEnabled = searchQuery.length === 0;
  const gridData = isReorderEnabled ? albums : filteredAlbums;

  const renderAlbumItem = useCallback(
    ({item}: {item: Album}) => (
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
          <Text style={styles.textCountPhoto}>
            {`фотографий ${item.countPhoto}`}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [openAlbum, styles],
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={setStatusBarTheme(appSettings.darkMode)}
        translucent
        backgroundColor="transparent"
      />
      <NaviBar
        openModalAlbum={openCreateAlbumModal}
        openModalSettings={openSettings}
      />

      <AlbumSearchBar
        darkMode={appSettings.darkMode}
        onSearch={setSearchQuery}
      />

      {filteredAlbums.length === 0 && searchQuery.length > 0 && (
        <View style={styles.emptyDataItem}>
          <Text style={styles.text}>По поиску ничего не найдено</Text>
        </View>
      )}

      {searchQuery.length > 0 && (
        <Text style={styles.textHelper}>
          Сортировка отключена во время поиска
        </Text>
      )}

      {albums.length > 0 && (
        <CounterMediaData
          albumCount={albumCount}
          photoCount={photoCount}
          darkMode={appSettings.darkMode}
        />
      )}

      {fetchingAlbums ? (
        <ActivityIndicator size="large" color={COLOR.LOAD} style={{flex: 1}} />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{paddingBottom: insets.bottom + 20}}
          showsVerticalScrollIndicator={false}>
          <Sortable.Grid
            data={gridData}
            columns={2}
            rowGap={10}
            columnGap={10}
            strategy="insert"
            scrollableRef={scrollRef}
            autoScrollEnabled={isReorderEnabled}
            autoScrollActivationOffset={80}
            showDropIndicator={isReorderEnabled}
            dropIndicatorStyle={styles.dropIndicator}
            keyExtractor={item => String(item.id)}
            renderItem={renderAlbumItem}
            onOrderChange={isReorderEnabled ? handleOrderChange : undefined}
          />
        </ScrollView>
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
    </SafeAreaView>
  );
};

export default MainPage;

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
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
    text: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    textHelper: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
  });
};
