import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, Modal, StatusBar} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Button, Divider} from 'react-native-paper';
import {COLOR} from '../../../assets/colorTheme';
import {ModalText} from '../../../assets/textForModal';
import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import {usePhotoRequest} from '../../hooks/usePhotoRequest';
import {useSettingsRequest} from '../../hooks/useSettingsRequest';
import {usePinCodeRequest} from '../../hooks/usePinCodeRequest';
import {
  useAppSettings,
  setButtonColor,
  setButtonTextColorRecommendation,
  setSvgIconColor,
  setAlertColor,
} from '../../../assets/settingsContext';
import {borderButtonStyle} from '../../../assets/colorTheme';
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
  const {checkActivePinCode} = usePinCodeRequest();
  const {getSettings} = useSettingsRequest();
  const {appSettings} = useAppSettings();

  const navigation: any = useNavigation();

  const [safetyVisible, setSafetyVisible] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    sortOrder: 'newest',
  });

  // Копия настроек для возврата в случае отмены
  const [backupSettings, setBackupSettings] = useState<Settings>({
    darkMode: false,
    sortOrder: 'newest',
  });

  const [isVisibleAcceptModal, setIsVisibleAcceptModal] = useState(false);

  const handleOpenAcceptModal = () => setIsVisibleAcceptModal(true);
  const handleCloseAcceptModal = () => setIsVisibleAcceptModal(false);

  const toggleSwitch = (key: keyof Settings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  // Сохраняем текущие настройки при открытии окна
  useEffect(() => {
    if (visible) {
      setBackupSettings(appSettings);
      setSettings(appSettings);
    }
    console.log('test');
  }, [visible, appSettings]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleCloseSettingsModal = () => {
    onClose();
    setSettings(backupSettings); // Возвращаем исходные настройки
  };

  const setPinCode = () => {
    try {
      handleCloseSettingsModal();
      navigation.navigate('RegistrationPage', {
        installationPinStage: true,
        inputMode: 2,
      });
    } catch (error) {
      return;
    }
  };

  const deletePinCode = () => {
    try {
      handleCloseSettingsModal();
      navigation.navigate('RegistrationPage', {
        installationPinStage: true,
        inputMode: 1,
        instruction: 'delete',
      });
    } catch (error) {
      return;
    }
  };

  const deleteAllAlbumsExpand = () => {
    deleteAllAlbums(),
      deleteAllPhotos(),
      handleCloseAcceptModal(),
      eventEmitter.emit('albumsUpdated');
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

  const styles = getStyles(appSettings.darkMode);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseSettingsModal}>
      <StatusBar translucent backgroundColor="black" />
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
              dropdownIconColor={appSettings.darkMode ? 'white' : 'black'}
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
          <View style={styles.securItem}>
            <Text style={styles.smallText}>Безопасность:</Text>
            <View style={styles.topSpacer} />
            {safetyVisible ? (
              <Button
                textColor={setButtonTextColorRecommendation(
                  appSettings.darkMode,
                )}
                icon={() => (
                  <SvgPassword color={setSvgIconColor(appSettings.darkMode)} />
                )}
                mode="text"
                onPress={() => setPinCode()}>
                Установить ПИН-код
              </Button>
            ) : (
              <Button
                textColor={setAlertColor(appSettings.darkMode)}
                icon={() => (
                  <SvgPassword color={setSvgIconColor(appSettings.darkMode)} />
                )}
                mode="text"
                onPress={() => deletePinCode()}>
                Удалить ПИН-код
              </Button>
            )}
          </View>
          <Divider />
          <View style={styles.deleteAlbumsItem}>
            <Text style={styles.smallText}>Очистка:</Text>
            <View style={styles.topSpacer} />
            <Button
              textColor={setAlertColor(appSettings.darkMode)}
              icon={() => (
                <SvgDeleteAlbums
                  color={setSvgIconColor(appSettings.darkMode)}
                />
              )}
              mode="text"
              onPress={() => handleOpenAcceptModal()}>
              Удалить все альбомы
            </Button>
          </View>
          <View style={styles.buttonsItem}>
            <Button
              mode="contained"
              style={borderButtonStyle()}
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleSave()}>
              Сохранить
            </Button>
            <Button
              mode="contained"
              style={borderButtonStyle()}
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleCloseSettingsModal()}>
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
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
      padding: 20,
      borderRadius: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
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
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
    },
    smallText: {
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
    dropdownIconColor: {
      color: 'red',
    },
  });
};

export default SettingsModal;
