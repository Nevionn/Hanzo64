import React from 'react';
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
interface GridItem {
  id: string;
  title: string;
  img: string;
}

const data: GridItem[] = [
  {id: '1', title: 'Item 1', img: 'https://via.placeholder.com/150'},
  {id: '2', title: 'Item 2', img: 'https://via.placeholder.com/150'},
  {id: '3', title: 'Item 3', img: 'https://via.placeholder.com/150'},
  {id: '4', title: 'Item 4', img: 'https://via.placeholder.com/150'},
  {id: '5', title: 'Item 5', img: 'https://via.placeholder.com/150'},
  {id: '6', title: 'Item 6', img: 'https://via.placeholder.com/150'},
  {id: '7', title: 'Item 7', img: 'https://via.placeholder.com/150'},
  {id: '8', title: 'Item 8', img: 'https://via.placeholder.com/150'},
  {id: '9', title: 'Item 9', img: 'https://via.placeholder.com/150'},
];

const Test: React.FC = () => {
  const renderItem = ({item}: {item: GridItem}) => (
    <View style={styles.item}>
      <Image source={{uri: item.img}} style={styles.image} />
      <Text style={styles.text}>{item.title}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item: GridItem) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  item: {
    backgroundColor: '#ccc',
    flex: 1,
    margin: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Test;
