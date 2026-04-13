import React, {useState, useEffect, useCallback} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import DraggableGridView from 'react-native-drag-sort-gridview';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import NaviBar from '../components/Navibar';
import AlbumSearchBar from '../components/AlbumSearchBar';
import CounterMediaData from '../components/CounterMediaData';
import NewAlbumModal from '../components/modals/NewAlbumModal';
import SettingsModal from '../components/modals/SettingsModal';

import {COLOR} from '../shared/colorTheme';
import {TYPOGRAPHY} from '../shared/typography';

import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import useMediaInformation from '../hooks/useMediaInformation';
import {useSettingsStore} from '../store/settings/useSettingsStore';
import eventEmitter from '../utils/eventEmitter';

interface Album {
  id: string;
  title: string;
  description?: string;
  countPhoto: number;
  created_at: string;
  coverPhoto: string;
}

const MainPage: React.FC = () => {
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();

  const darkMode = useSettingsStore(state => state.settings.darkMode);

  const {addAlbum, getAllAlbums, saveAlbumsOrder} = useAlbumsRequest();
  const {calcAllAlbums, calcAllPhotos} = useMediaInformation();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [fetching, setFetching] = useState(false);

  const [albumCount, setAlbumCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');

  const [addModal, setAddModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const styles = getStyles(darkMode);

  useEffect(() => {
    const load = () => {
      setFetching(true);
      getAllAlbums((data: Album[]) => {
        setAlbums(data);
        setFetching(false);
      });
    };

    load();
    eventEmitter.on('albumsUpdated', load);

    return () => {
      eventEmitter.off('albumsUpdated', load);
    };
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const [a, p] = await Promise.all([calcAllAlbums(), calcAllPhotos()]);

      setAlbumCount(a);
      setPhotoCount(p);
    };

    fetchCounts();
  }, []);

  const openAlbum = (album: Album) => {
    navigation.navigate('PhotoPage', {album});
  };

  const filteredAlbums = albums.filter(album => {
    const q = searchQuery.toLowerCase();
    return (
      album.title.toLowerCase().includes(q) ||
      (album.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const isReorderEnabled = searchQuery.length === 0;
  const gridData = isReorderEnabled ? albums : filteredAlbums;

  const onOrderChanged = useCallback(
    (orderedData: Album[], from: number, to: number) => {
      setAlbums(orderedData);
      saveAlbumsOrder(orderedData);
      setIsDragging(false);
    },
    [saveAlbumsOrder],
  );

  const handleAddAlbum = (newAlbum: {title: string; description?: string}) => {
    const currentDate = new Date();

    const albumToInsert = {
      title: newAlbum.title,
      description: newAlbum.description,
      countPhoto: 0,
      created_at: currentDate.toLocaleString(),
    };

    addAlbum(albumToInsert);
    getAllAlbums(setAlbums);
    eventEmitter.emit('albumsUpdated');
  };

  const renderItem = useCallback(
    ({item}: {item: Album}) => (
      <TouchableOpacity
        style={styles.placeHolder}
        delayLongPress={200}
        onLongPress={() => {
          if (isReorderEnabled) {
            setIsDragging(true);
          }
        }}
        onPress={() => {
          if (isDragging) {
            setIsDragging(false);
            return;
          }
          openAlbum(item);
        }}>
        <View style={styles.imagePlace}>
          <Image
            source={
              item.coverPhoto
                ? {uri: `data:image/jpeg;base64,${item.coverPhoto}`}
                : require('../../assets/images/not_img_default.png')
            }
            style={styles.image}
          />
        </View>

        <View style={styles.textImageHolder}>
          <Text style={styles.textNameAlbum}>
            {item.title.length > 20
              ? item.title.slice(0, 20) + '...'
              : item.title}
          </Text>
          <Text style={styles.textCountPhoto}>
            фотографий {item.countPhoto}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [isDragging, isReorderEnabled, styles],
  );

  const keyExtractor = useCallback((item: Album) => `album-${item.id}`, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <NaviBar
        openModalAlbum={() => setAddModal(true)}
        openModalSettings={() => setSettingsModal(true)}
      />

      <AlbumSearchBar darkMode={darkMode} onSearch={setSearchQuery} />

      {albums.length > 0 && (
        <CounterMediaData
          albumCount={albumCount}
          photoCount={photoCount}
          darkMode={darkMode}
        />
      )}

      {fetching ? (
        <ActivityIndicator size="large" color={COLOR.LOAD} style={{flex: 1}} />
      ) : (
        <DraggableGridView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: insets.bottom + 20}}
          data={gridData}
          isEditing={isDragging && isReorderEnabled}
          numColumns={2}
          itemHeight={240}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onOrderChanged={onOrderChanged}
        />
      )}
      <NewAlbumModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onSubmit={handleAddAlbum}
      />
      <SettingsModal
        visible={settingsModal}
        onCloseSettingsModal={() => setSettingsModal(false)}
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
    placeHolder: {
      width: '80%', // 🔥 ВАЖНО вместо flexBasis
      height: 240,
      margin: 8,
      borderRadius: 10,
      overflow: 'hidden', // 🔥 обязательно
    },
    imagePlace: {
      width: '100%',
      height: 180, // 🔥 фикс высота картинки
      borderWidth: 0.5,
      borderColor: 'white',
      borderRadius: 10,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover', // 🔥 ВАЖНО, иначе "линия"
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
      fontFamily: TYPOGRAPHY.titleFont,
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    textCountPhoto: {
      fontSize: 11,
      fontFamily: TYPOGRAPHY.generalFont,
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
    emptyDataItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      fontFamily: TYPOGRAPHY.generalFont,
    },
    textHelper: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
      fontFamily: TYPOGRAPHY.generalFont,
    },
  });
};
