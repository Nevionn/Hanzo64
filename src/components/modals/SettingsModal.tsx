import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, Modal, StatusBar} from 'react-native';
import {Button, Divider, List} from 'react-native-paper';
import {COLOR} from '../../shared/colorTheme';
import {ModalText} from '../../shared/textForModal';
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
  setArrowAccordionColor,
} from '../../utils/settingsContext';
import {useNavigation} from '@react-navigation/native';
import eventEmitter from '../../utils/eventEmitter';
import AcceptMoveModal from './AcceptMoveModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  albumsExist?: boolean;
}

interface Settings {
  darkMode: boolean;
}
const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  albumsExist,
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
  });

  // Копия настроек для возврата в случае отмены
  const [backupSettings, setBackupSettings] = useState<Settings>({
    darkMode: false,
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

  useEffect(() => {
    // Сохраняем текущие настройки при открытии окна
    if (visible) {
      setBackupSettings(appSettings);
      setSettings(appSettings);
    }
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
          <Divider style={styles.divider} />
          <List.AccordionGroup>
            <List.Accordion
              style={styles.accordionItem}
              titleStyle={styles.text}
              title="Безопасность"
              id="2"
              theme={{
                colors: setArrowAccordionColor(appSettings.darkMode),
              }}
              left={props => (
                <List.Icon
                  {...props}
                  color={setSvgIconColor(appSettings.darkMode)}
                  icon="lock-open-plus-outline"
                />
              )}>
              <View style={styles.accordionContentItem}>
                {safetyVisible ? (
                  <Button
                    textColor={setButtonTextColorRecommendation(
                      appSettings.darkMode,
                    )}
                    mode="text"
                    onPress={() => setPinCode()}>
                    Установить ПИН-код
                  </Button>
                ) : (
                  <Button
                    textColor={setAlertColor(appSettings.darkMode)}
                    mode="text"
                    onPress={() => deletePinCode()}>
                    Удалить ПИН-код
                  </Button>
                )}
              </View>
            </List.Accordion>
            <List.Accordion
              style={styles.accordionItem}
              titleStyle={styles.text}
              title="Очистка"
              id="3"
              theme={{
                colors: setArrowAccordionColor(appSettings.darkMode),
              }}
              left={props => (
                <List.Icon
                  {...props}
                  color={setSvgIconColor(appSettings.darkMode)}
                  icon="delete-alert-outline"
                />
              )}>
              <View style={styles.accordionContentItem}>
                {albumsExist && (
                  <Button
                    textColor={setAlertColor(appSettings.darkMode)}
                    mode="text"
                    onPress={() => handleOpenAcceptModal()}>
                    Удалить все альбомы
                  </Button>
                )}
              </View>
            </List.Accordion>
          </List.AccordionGroup>
          <View style={styles.buttonsItem}>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={setButtonColor(appSettings.darkMode)}
              onPress={() => handleSave()}>
              Сохранить
            </Button>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
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
    divider: {
      height: 0.1,
      marginVertical: 1,
      backgroundColor: !darkMode
        ? COLOR.dark.MAIN_COLOR
        : COLOR.light.MAIN_COLOR,
    },
    accordionItem: {
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
    },
    accordionContentItem: {
      alignItems: 'flex-start',
      backgroundColor: darkMode
        ? COLOR.dark.ACCORDION_ITEM_COLOR
        : COLOR.light.ACCORDION_ITEM_COLOR,
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
    mediaInformationItem: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: 14,
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
      // backgroundColor: darkMode
      //   ? COLOR.dark.SECONDARY_COLOR
      //   : COLOR.light.SECONDARY_COLOR,
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
