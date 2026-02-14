import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, Modal, StatusBar} from 'react-native';
import {Button, Divider, List} from 'react-native-paper';
import {useSettingsStore} from '../../store/settings/useSettingsStore';

import {
  setButtonColor,
  setButtonTextColorRecommendation,
  setSvgIconColor,
  setAlertColor,
  setArrowAccordionColor,
} from '../../utils/settingsContext';
import {COLOR} from '../../shared/colorTheme';
import {ModalText} from '../../shared/textForModal';

import {useAlbumsRequest} from '../../hooks/useAlbumsRequest';
import {usePhotoRequest} from '../../hooks/usePhotoRequest';
import {usePinCodeRequest} from '../../hooks/usePinCodeRequest';

import {useNavigation} from '@react-navigation/native';
import eventEmitter from '../../utils/eventEmitter';

import AcceptMoveModal from './AcceptMoveModal';

interface SettingsModalProps {
  visible: boolean;
  onCloseSettingsModal: () => void;
  albumsExist?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onCloseSettingsModal,
  albumsExist,
}) => {
  const {deleteAllAlbums} = useAlbumsRequest();
  const {deleteAllPhotos} = usePhotoRequest();
  const {checkActivePinCode} = usePinCodeRequest();

  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);
  const setSetting = useSettingsStore(state => state.setSetting);

  const navigation: any = useNavigation();

  const [safetyVisible, setSafetyVisible] = useState(true);
  const [isVisibleAcceptModal, setIsVisibleAcceptModal] = useState(false);

  const handleOpenAcceptModal = () => setIsVisibleAcceptModal(true);
  const handleCloseAcceptModal = () => setIsVisibleAcceptModal(false);

  const setPinCode = () => {
    try {
      onCloseSettingsModal();
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
      onCloseSettingsModal();
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
  }, []);

  const styles = getStyles(darkModeFromStore);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCloseSettingsModal}>
      <StatusBar translucent backgroundColor="black" />
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Настройки</Text>
          <View style={styles.setting}>
            <Text style={styles.smallText}>Темная тема</Text>
            <Switch
              value={darkModeFromStore}
              onValueChange={value => setSetting('darkMode', value)}
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
                colors: setArrowAccordionColor(darkModeFromStore),
              }}
              left={props => (
                <List.Icon
                  {...props}
                  color={setSvgIconColor(darkModeFromStore)}
                  icon="lock-open-plus-outline"
                />
              )}>
              <View style={styles.accordionContentItem}>
                {safetyVisible ? (
                  <Button
                    textColor={setButtonTextColorRecommendation(
                      darkModeFromStore,
                    )}
                    mode="text"
                    onPress={() => setPinCode()}>
                    Установить ПИН-код
                  </Button>
                ) : (
                  <Button
                    textColor={setAlertColor(darkModeFromStore)}
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
                colors: setArrowAccordionColor(darkModeFromStore),
              }}
              left={props => (
                <List.Icon
                  {...props}
                  color={setSvgIconColor(darkModeFromStore)}
                  icon="delete-alert-outline"
                />
              )}>
              <View style={styles.accordionContentItem}>
                {albumsExist && (
                  <Button
                    textColor={setAlertColor(darkModeFromStore)}
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
              buttonColor={setButtonColor(darkModeFromStore)}
              onPress={() => onCloseSettingsModal()}>
              Закрыть
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
      justifyContent: 'flex-end',
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
