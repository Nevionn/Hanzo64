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
  TouchableOpacity,
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
import {useNavigation, useRoute} from '@react-navigation/native';
import NavibarPhoto from '../components/NavibarPhoto';
import ImageViewer from '../components/ImageViewer';

interface Photo {
  id: string;
}

const PhotoPage = () => {
  const route: any = useRoute();
  const dataAlbum = route?.params;
  console.log('переданные параметры альбома:', dataAlbum);

  const [photos, setPhotos] = useState<Photo[]>([
    // {id: '1'},
    // {id: '2'},
    // {id: '3'},
    // {id: '4'},
    // {id: '5'},
    // {id: '6'},
    // {id: '7'},
    // {id: '8'},
    // {id: '9'},
    // {id: '10'},
    // {id: '11'},
    // {id: '12'},
    // {id: '13'},
    // {id: '14'},
    // {id: '15'},
    // {id: '16'},
    // {id: '17'},
  ]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const styles = getStyles(isDarkTheme);
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.topSpacer} />
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.placeHolder}
              onPress={() => console.log('test')}>
              <Image
                source={require('../../assets/images/EHHttyOYx_Y.jpg')}
                style={styles.image}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyDataItem}>
          <Text>Тут пусто</Text>
        </View>
      )}

      <NavibarPhoto
        titleAlbum={dataAlbum.album.title}
        idAlbum={dataAlbum.album.id}
      />
      {/* <View>
        <ImageViewer />
      </View> */}
    </View>
  );
};

const getStyles = (isDarkTheme: boolean) => {
  return StyleSheet.create({
    root: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 62,
      backgroundColor: isDarkTheme
        ? COLOR.dark.MAIN_COLOR
        : COLOR.light.MAIN_COLOR,
    },
    topSpacer: {
      height: '19%',
    },
    placeHolder: {
      margin: 2,
      height: 120,
      width: Dimensions.get('window').width / 3 - 4, // Расчет ширины для 3 элементов в ряд
      aspectRatio: 1, // Поддерживает квадратную форму
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
  });
};

export default PhotoPage;
