import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import SvgSettings from './icons/SvgSettings';
import NaviBarProps from '../types/NaviBarProps';

const NaviBar: React.FC<NaviBarProps> = ({
  openModalAlbum,
  openModalSettings,
}) => {
  const statusBarHeight: any = StatusBar.currentHeight;

  return (
    <>
      <View style={[styles.navibar, {top: statusBarHeight - 5}]}>
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
            <SvgSettings />
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navibar: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    width: '100%',
    zIndex: 10,
  },
  textHead: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textAddNewAlbum: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  touchArea: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default NaviBar;
