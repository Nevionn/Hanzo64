import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
import NaviBar from '../components/Navibar';
import {useNavigation} from '@react-navigation/native';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {useSettingsRequest} from '../hooks/useSettingsRequest';
import {useAppSettings} from '../../assets/settingsContext';
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

  const [isModalAddAlbumVisible, setModalAddAlbumVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    getSettings(saveAppSettings);
  }, [appSettings.darkMode]);

  useEffect(() => {
    const updateAlbums = () => {
      getAllAlbums(setAlbums, appSettings.sortOrder);
    };

    updateAlbums();

    eventEmitter.on('albumsUpdated', updateAlbums);
    return () => {
      eventEmitter.off('albumsUpdated', updateAlbums);
    };
  }, [appSettings.sortOrder]);

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
  };

  const openAlbum = (album: Album) => {
    navigation.navigate('PhotoPage', {album});
  };

  const styles = getStyles(appSettings.darkMode);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.topSpacer} />
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
      />
      <NewAlbumModal
        visible={isModalAddAlbumVisible}
        onClose={() => setModalAddAlbumVisible(false)}
        onSubmit={handleAddAlbum}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onSave={saveSettings}
      />
      <NaviBar
        openModalAlbum={openCreateAlbumModal}
        openModalSettings={openSettings}
      />
    </View>
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
    placeHolder: {
      flex: 1,
      margin: 10,
      height: 220,
    },
    imagePlace: {
      flex: 1,
      width: '100%',
      borderWidth: 0.5,
      borderColor: 'white',
      borderRadius: 10,
      aspectRatio: 1,
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
  });
};
