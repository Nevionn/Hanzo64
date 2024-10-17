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
import ImageViewer from '../components/ImageViewer';
import NewAlbumModal from '../components/NewAlbumModal';
import {Image as SvgImage} from 'react-native-svg';
const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

interface Album {
  id: string;
  title: string;
  countPhoto: number;
}

const MainPage: React.FC = () => {
  const {showTableContent, dropTable} = usePinCodeRequest();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddAlbum = (newAlbum: {title: string}) => {
    const newId = (albums.length + 1).toString();
    setAlbums([...albums, {id: newId, title: newAlbum.title, countPhoto: 12}]);
  };

  const openCreateAlbumModal = () => {
    setModalVisible(true);
  };

  return (
    <View style={[styles.root, {backgroundColor: COLOR.MAIN_COLOR}]}>
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
      {/* <View>
        <ImageViewer />
      </View> */}
      <View style={styles.testBlock}>
        <Cbutton
          styleButton={{height: 40}}
          styleText={{}}
          colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
          isShadow={true}
          isVisible={true}
          name={'Проверить пинкод'}
          onPress={() => {
            showTableContent();
          }}
        />
        <Cbutton
          styleButton={{height: 40}}
          styleText={{}}
          colorButton={{backgroundColor: COLOR.BUTTON_COLOR}}
          isShadow={true}
          isVisible={true}
          name={'drop table'}
          onPress={() => {
            dropTable('PinCodeTable');
          }}
        />
      </View>
      <NaviBar openModalAlbum={openCreateAlbumModal} />
    </View>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
