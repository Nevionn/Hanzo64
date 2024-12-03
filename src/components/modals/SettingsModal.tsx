import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, Modal} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Button, Divider} from 'react-native-paper';
import {COLOR} from '../../../assets/colorTheme';
import {ModalText} from '../../../assets/textForModal';
import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import {usePhotoRequest} from '../../hooks/usePhotoRequest';
import {useSettingsRequest} from '../../hooks/useSettingsRequest';
import {usePinCodeRequest} from '../../hooks/usePinCodeRequest';
import {useNavigation} from '@react-navigation/native';
import eventEmitter from '../../../assets/eventEmitter';
import SvgPassword from '../icons/SvgPassword';
import SvgDeleteAlbums from '../icons/SvgDeleteAlbums';
import AcceptMoveModal from './AcceptMoveModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

interface Settings {
  darkMode: boolean;
  sortOrder: 'newest' | 'oldest' | 'byName';
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const {deleteAllAlbums} = useAlbumsRequest();
  const {deleteAllPhotos} = usePhotoRequest();

  const navigation: any = useNavigation();

  const {checkActivePinCode} = usePinCodeRequest();
  const {getSettings} = useSettingsRequest();

  const [safetyVisible, setSafetyVisible] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    sortOrder: 'newest',
  });

  const [isVisibleAcceptModal, setIsVisibleAcceptModal] = useState(false);

  const toggleSwitch = (key: keyof Settings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleCloseSettingsModal = () => {
    onClose();
    getSettings(setSettings);
  };

  const handleOpenAcceptModal = () => {
    setIsVisibleAcceptModal(true);
  };

  const handleCloseAcceptModal = () => {
    setIsVisibleAcceptModal(false);
  };

  const setPinCode = () => {
    try {
      handleCloseSettingsModal();
      navigation.navigate('RegistrationPage', {installationPinStage: true});
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    checkActivePinCode((isActive: boolean, isSkip: boolean) => {
      if (isActive) {
        setSafetyVisible(false);
      }
      if (isSkip) {
        setSafetyVisible(true);
      }
    });
    getSettings(setSettings);
  }, []);

  const deleteAllAlbumsExpand = () => {
    deleteAllAlbums(),
      handleCloseAcceptModal(),
      eventEmitter.emit('albumsUpdated');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseSettingsModal}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Настройки</Text>

          <View style={styles.setting}>
            <Text style={styles.smallText}>Темная тема</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSwitch('darkMode')}
            />
          </View>
          <Divider />
          <View style={styles.topSpacer} />
          <View style={styles.sortItem}>
            <Text style={styles.smallText}>Сортировка:</Text>
            <Picker
              selectedValue={settings.sortOrder}
              style={styles.pickerItem}
              dropdownIconColor={'white'}
              onValueChange={itemValue =>
                setSettings(prevSettings => ({
                  ...prevSettings,
                  sortOrder: itemValue as Settings['sortOrder'],
                }))
              }>
              <Picker.Item
                style={styles.text}
                label="Новые альбомы"
                value="newest"
              />
              <Picker.Item
                style={styles.text}
                label="Старые альбомы"
                value="oldest"
              />
              <Picker.Item
                style={styles.text}
                label="По имени"
                value="byName"
              />
            </Picker>
          </View>
          <Divider />
          {safetyVisible && (
            <View style={styles.securItem}>
              <Text style={styles.smallText}>Безопасность:</Text>
              <View style={styles.topSpacer} />
              <Button
                textColor={COLOR.dark.BUTTON_TEXT}
                icon={() => <SvgPassword />}
                mode="text"
                onPress={() => setPinCode()}>
                Установить ПИН-код
              </Button>
            </View>
          )}
          <Divider />
          <View style={styles.deleteAlbumsItem}>
            <Text style={styles.smallText}>Очистка:</Text>
            <View style={styles.topSpacer} />
            <Button
              textColor={COLOR.alertColor}
              icon={() => <SvgDeleteAlbums />}
              mode="text"
              onPress={() => handleOpenAcceptModal()}>
              Удалить все альбомы
            </Button>
          </View>
          <View style={styles.buttonsItem}>
            <Button mode="contained" onPress={() => handleSave()}>
              Сохранить
            </Button>
            <Button mode="contained" onPress={() => handleCloseSettingsModal()}>
              Отмена
            </Button>
          </View>
        </View>
        <AcceptMoveModal
          visible={isVisibleAcceptModal}
          onCloseAcceptModal={handleCloseAcceptModal}
          onConfirm={deleteAllAlbumsExpand}
          title={ModalText.deleteAllAlbums.title}
          textBody={ModalText.deleteAllAlbums.textBody}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLOR.dark.SECONDARY_COLOR,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortItem: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  securItem: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  deleteAlbumsItem: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  pickerItem: {
    height: 50,
    width: 190,
  },
  buttonsItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  topSpacer: {
    height: 10,
  },
  text: {
    color: 'white',
  },
  smallText: {
    color: COLOR.dark.TEXT_DIM,
  },
});

export default SettingsModal;
