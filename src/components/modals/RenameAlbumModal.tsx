import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Button} from 'react-native-paper';

import {COLOR} from '../../shared/colorTheme';
import {TYPOGRAPHY} from '../../shared/typography';

import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import {useSettingsStore} from '../../store/settings/useSettingsStore';
import eventEmitter from '../../utils/eventEmitter';

interface RenameAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newTitile: string, newDescription: string) => void;
  title: string;
  description?: string;
  idAlbum: string;
}

const RenameAlbumModal: React.FC<RenameAlbumModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  description,
  idAlbum,
}) => {
  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);
  const {renameAlbum} = useAlbumsRequest();

  const [titleAlbum, setTitleAlbum] = useState<string>(title);
  const [descriptionAlbum, setDescriptionAlbum] = useState<string>(
    description || '',
  );

  useEffect(() => {
    if (visible) {
      setTitleAlbum(title);
      setDescriptionAlbum(description || '');
    }
  }, [visible, title, description]);

  const handleSave = () => {
    if (titleAlbum.trim()) {
      renameAlbum(idAlbum, titleAlbum, descriptionAlbum);

      eventEmitter.emit('albumsUpdated');
      onSubmit(titleAlbum, descriptionAlbum);
      onClose();
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  const styles = getStyles(darkModeFromStore);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleCloseModal}>
      <StatusBar translucent backgroundColor="black" />

      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Редактировать альбом</Text>

          <TextInput
            style={styles.input}
            placeholder="Название"
            value={titleAlbum}
            onChangeText={setTitleAlbum}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Описание"
            value={descriptionAlbum}
            onChangeText={setDescriptionAlbum}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={
                darkModeFromStore
                  ? COLOR.dark.BUTTON_COLOR
                  : COLOR.light.BUTTON_COLOR
              }
              onPress={handleSave}>
              Сохранить
            </Button>

            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={
                darkModeFromStore
                  ? COLOR.dark.BUTTON_COLOR
                  : COLOR.light.BUTTON_COLOR
              }
              onPress={handleCloseModal}>
              Отмена
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (darkMode: boolean) => {
  return StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '80%',
      padding: 20,
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontFamily: TYPOGRAPHY.generalFont,
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#ccc' : 'black',
      fontFamily: TYPOGRAPHY.generalFont,
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  });
};

export default RenameAlbumModal;
