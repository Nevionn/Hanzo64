import React, {useEffect, useState} from 'react';
import {Text, View, TextStyle} from 'react-native';
import {COLOR} from '../shared/colorTheme';
import {useSettingsStore} from '../store/settings/useSettingsStore';

const UploadingIndicator = ({uploadingPhotos}: {uploadingPhotos: boolean}) => {
  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);

  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!uploadingPhotos) return;

    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 600);

    return () => clearInterval(interval);
  }, [uploadingPhotos]);

  const uploadingText: TextStyle = {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: darkModeFromStore ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
  };

  return (
    <View>
      <Text style={uploadingText}>Загрузка новых фотографий{dots}</Text>
    </View>
  );
};

export default UploadingIndicator;
