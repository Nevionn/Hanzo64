import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import SvgSettings from './icons/SvgSettings';
import {COLOR} from '../shared/colorTheme';
import {useAppSettings} from '../utils/settingsContext';

interface NaviBarProps {
  openModalAlbum: () => void;
  openModalSettings: () => void;
}

const NaviBar: React.FC<NaviBarProps> = ({
  openModalAlbum,
  openModalSettings,
}) => {
  const {appSettings} = useAppSettings();

  const styles = getStyles(appSettings.darkMode);

  return (
    <>
      <View style={[styles.navibar]}>
        {appSettings.darkMode ? (
          <ImageBackground
            source={require('../../assets/images/navibar.png')}
            style={styles.backgroundImage}>
            <TouchableOpacity onPress={openModalAlbum} style={styles.touchArea}>
              <Text style={styles.textAddNewAlbum}>+</Text>
            </TouchableOpacity>
            <Text style={styles.textHead}>Альбомы</Text>
            <TouchableOpacity
              onPress={openModalSettings}
              style={styles.touchArea}>
              <SvgSettings color={'#fff'} />
            </TouchableOpacity>
          </ImageBackground>
        ) : (
          <View style={styles.backgroundImage}>
            <TouchableOpacity onPress={openModalAlbum} style={styles.touchArea}>
              <Text style={styles.textAddNewAlbum}>+</Text>
            </TouchableOpacity>
            <Text style={styles.textHead}>Альбомы</Text>
            <TouchableOpacity
              onPress={openModalSettings}
              style={styles.touchArea}>
              <SvgSettings color={COLOR.light.ICON} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    navibar: {
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection: 'row',
      height: 70,
      width: '100%',
      zIndex: 10,
    },
    textHead: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.ICON,
      fontSize: 20,
      fontWeight: 'bold',
    },
    textAddNewAlbum: {
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.ICON,
      fontSize: 28,
      fontWeight: 'bold',
    },
    touchArea: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      width: 40,
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: COLOR.light.NAVIBAR_COLOR,
    },
  });
};

export default NaviBar;
