import React, {useState, useEffect, useCallback} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
import NaviBar from '../components/Navibar';
import Cbutton from '../components/Cbutton';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';
import {useAlbumsRequest} from '../hooks/useAlbumsRequest';
import {useSettingsRequest} from '../hooks/useSettingsRequest';
import ImageViewer from '../components/ImageViewer';
import NewAlbumModal from '../components/modals/NewAlbumModal';
import SettingsModal from '../components/modals/SettingsModal';
import {Image as SvgImage} from 'react-native-svg';
import {Button} from 'react-native-paper';
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

interface Album {
  id: string;
  title: string;
  countPhoto: number;
  created_at: string;
}

const MainPage: React.FC = () => {
  const {showTableContent, dropTable} = usePinCodeRequest();
  const {addAlbum, getAllAlbums, showAlbums, showShemeAlbumsTable} =
    useAlbumsRequest();
  const {acceptSettings, getSettings, showSettings} = useSettingsRequest();

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    sortOrder: 'newest' as 'newest' | 'oldest',
  });
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    getSettings(setAppSettings);
  }, []);

  useEffect(() => {
    getAllAlbums((fetchedAlbums: Album[]) => {
      const sortedAlbums =
        appSettings.sortOrder === 'oldest'
          ? [...fetchedAlbums].reverse()
          : fetchedAlbums;
      setAlbums(sortedAlbums);
    });
  }, [appSettings.sortOrder]);

  const openSettings = () => setIsSettingsModalVisible(true);

  const saveSettings = (newSettings: typeof appSettings) => {
    setAppSettings(newSettings);
    console.log('Настройки сохранены:', newSettings);
    acceptSettings(newSettings); // Передаём настройки в базу данных
  };

  const openCreateAlbumModal = () => setModalVisible(true);

  const handleAddAlbum = (newAlbum: {title: string}) => {
    const currentDate = new Date();

    const albumToInsert = {
      title: newAlbum.title,
      countPhoto: 0,
      created_at: currentDate.toLocaleString(),
    };
    addAlbum(albumToInsert), getAllAlbums(setAlbums);
  };

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
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.placeHolder}>
            <View style={styles.imagePlace}>
              <Image
                source={require('../../assets/images/not_img_default.png')}
                style={styles.image}
              />
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
          </View>
        )}
      />
      <NewAlbumModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddAlbum}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onSave={saveSettings}
      />
      {/* <View>
        <ImageViewer />
      </View> */}
      <View style={styles.testBlock}>
        <Button
          mode="contained"
          onPress={() => {
            showSettings(); // showShemeAlbumsTable('AlbumsTable')
          }}>
          настройки
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            dropTable('AlbumsTable');
          }}>
          Дропнуть таблицу
        </Button>
      </View>
      <NaviBar
        openModalAlbum={openCreateAlbumModal}
        openModalSettings={openSettings}
      />
    </View>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: COLOR.MAIN_COLOR,
  },
  topSpacer: {
    height: '15%',
  },
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  placeHolder: {
    flex: 1,
    backgroundColor: 'transparent',
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
    color: 'white',
  },
  textCountPhoto: {
    fontSize: 12,
    color: '#ACACAC',
  },
  text: {
    color: 'white',
    alignItems: 'center',
    fontSize: 18,
  },
  testBlock: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 200,
  },
});
