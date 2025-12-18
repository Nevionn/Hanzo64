import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {COLOR} from '../shared/colorTheme';

interface AlbumSearchBarProps {
  darkMode: boolean;
  onSearch: (query: string) => void;
}

/**
 * Компонент, использующийся на главной странице, позволяющий делать поиск по альбому
 * @returns {JSX.component}
 */

const AlbumSearchBar: React.FC<AlbumSearchBarProps> = ({
  darkMode,
  onSearch,
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <Searchbar
      placeholder="Поиск альбома"
      value={query}
      onChangeText={handleChange}
      style={[
        styles.searchbar,
        {
          backgroundColor: darkMode
            ? COLOR.dark.SECONDARY_COLOR
            : COLOR.light.SECONDARY_COLOR,
        },
      ]}
      iconColor={darkMode ? 'white' : 'black'}
      inputStyle={{
        color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      }}
      placeholderTextColor={darkMode ? '#aaa' : '#666'}
    />
  );
};

export default AlbumSearchBar;

const styles = StyleSheet.create({
  searchbar: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 10,
  },
});
