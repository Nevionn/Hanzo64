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
} from 'react-native';
import {COLOR} from '../../assets/colorTheme';
import NaviBar from '../components/Navibar';
import Cbutton from '../components/Cbutton';
import {usePinCodeRequest} from '../hooks/usePinCodeRequest';
const MainPage = () => {
  const {showTableContent} = usePinCodeRequest();
  return (
    <View style={[styles.root, {backgroundColor: COLOR.MAIN_COLOR}]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView contentContainerStyle={styles.root}>
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
      </ScrollView>
      <NaviBar />
    </View>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    alignItems: 'center',
    fontSize: 18,
  },
});
