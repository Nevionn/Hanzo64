import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLOR} from '../shared/colorTheme';

interface CounterMediaDataProps {
  albumCount: number;
  photoCount: number;
  darkMode: boolean;
}

/**
 * Отображает информацию о количестве альбомов и фотографий
 * Используется на главной странице
 *
 * @returns {JSX.Element} CounterMediaData
 */

const CounterMediaData: React.FC<CounterMediaDataProps> = ({
  albumCount,
  photoCount,
  darkMode,
}) => {
  const styles = getStyles(darkMode);

  return (
    <View style={styles.countItem}>
      <Text style={styles.textDim}>
        Альбомов: {albumCount} {'\u00A0\u00A0\u00A0'} фотографий: {photoCount}
      </Text>
    </View>
  );
};

export default CounterMediaData;

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    countItem: {
      height: 34,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textDim: {
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
  });
