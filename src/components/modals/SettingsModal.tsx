import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, Modal, StatusBar} from 'react-native';
import {Button, Divider, List} from 'react-native-paper';
import {useSettingsStore} from '../../store/settings/useSettingsStore';

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

/**
 * Компонент модального окна настроек приложения.
 *
 * Отображает:
 * - Переключатель темной темы.
 * - Блоки для "Безопасности" и "Очистки":
 *   - Безопасность: установка/удаление ПИН-кода и опция удаления данных после 3 неверных попыток.
 *   - Очистка: удаление всех альбомов.
 *
 * Используемые хуки:
 * - useSettingsStore для состояния темы.
 * - useAlbumsRequest, usePhotoRequest, usePinCodeRequest для работы с данными.
 *
 * Особенности:
 * - Модальные подтверждения через AcceptMoveModal.
 */

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onCloseSettingsModal,
  albumsExist,
}) => {
  const {deleteAllAlbums} = useAlbumsRequest();
  const {deleteAllPhotos} = usePhotoRequest();
  const {checkActivePinCode, toggleWipeOnFail, getWipeOnFail} =
    usePinCodeRequest();

  const darkModeFromStore = useSettingsStore(state => state.settings.darkMode);
  const setSetting = useSettingsStore(state => state.setSetting);

  const navigation: any = useNavigation();

  const [safetyVisible, setSafetyVisible] = useState(true);
  const [isVisibleAcceptModal, setIsVisibleAcceptModal] = useState(false);
  const [wipeOnFail, setWipeOnFail] = useState(false);

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

  useEffect(() => {
    getWipeOnFail(setWipeOnFail);
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
              thumbColor={darkModeFromStore ? '#00F0FF' : '#999'}
            />
          </View>
          <Divider style={styles.divider} />
          <List.AccordionGroup>
            <List.Accordion
              style={styles.accordionItem}
              titleStyle={styles.text}
              title="Безопасность"
              id="1"
              left={props => (
                <List.Icon
                  {...props}
                  icon="lock"
                  color={darkModeFromStore ? COLOR.dark.ICON : COLOR.light.ICON}
                />
              )}
              theme={{
                colors: darkModeFromStore
                  ? {onSurfaceVariant: COLOR.dark.ICON}
                  : {onSurfaceVariant: COLOR.light.ICON},
              }}>
              {safetyVisible ? (
                <List.Item
                  title="Установить ПИН-код"
                  left={props => (
                    <List.Icon {...props} icon="key-chain-variant" />
                  )}
                  theme={{
                    colors: darkModeFromStore
                      ? {onSurfaceVariant: COLOR.dark.ICON}
                      : {onSurfaceVariant: COLOR.light.ICON},
                  }}
                  titleStyle={{
                    color: darkModeFromStore
                      ? COLOR.dark.BUTTON_TEXT_GREEN
                      : COLOR.light.BUTTON_TEXT_GREEN,
                  }}
                  onPress={setPinCode}
                  style={styles.accordionContentItem}
                />
              ) : (
                <>
                  <List.Item
                    title="Удалить ПИН-код"
                    left={props => (
                      <List.Icon {...props} icon="key-alert-outline" />
                    )}
                    theme={{
                      colors: darkModeFromStore
                        ? {onSurfaceVariant: COLOR.dark.ICON}
                        : {onSurfaceVariant: COLOR.light.ICON},
                    }}
                    titleStyle={{
                      color: darkModeFromStore
                        ? COLOR.dark.alertColor
                        : COLOR.light.alertColor,
                    }}
                    onPress={deletePinCode}
                    style={styles.accordionContentItem}
                  />

                  <List.Item
                    style={[
                      styles.accordionContentItem,
                      {alignItems: 'flex-start'},
                    ]}
                    title={() => (
                      <Text
                        style={[
                          styles.smallText,
                          {flexShrink: 1, flexWrap: 'wrap'},
                        ]}>
                        Удалять данные после 3 неверных попыток
                      </Text>
                    )}
                    right={() => (
                      <Switch
                        value={wipeOnFail}
                        onValueChange={value => {
                          setWipeOnFail(value);
                          toggleWipeOnFail(value);
                        }}
                        thumbColor={wipeOnFail ? '#00F0FF' : '#999'}
                      />
                    )}
                  />
                </>
              )}
            </List.Accordion>
            <List.Accordion
              style={styles.accordionItem}
              titleStyle={styles.text}
              title="Очистка"
              id="2"
              left={props => (
                <List.Icon
                  {...props}
                  icon="delete"
                  color={darkModeFromStore ? COLOR.dark.ICON : COLOR.light.ICON}
                />
              )}
              theme={{
                colors: darkModeFromStore
                  ? {onSurfaceVariant: COLOR.dark.ICON}
                  : {onSurfaceVariant: COLOR.light.ICON},
              }}>
              {albumsExist && (
                <List.Item
                  title="Удалить все альбомы"
                  left={props => (
                    <List.Icon {...props} icon="delete-alert-outline" />
                  )}
                  theme={{
                    colors: darkModeFromStore
                      ? {onSurfaceVariant: COLOR.dark.ICON}
                      : {onSurfaceVariant: COLOR.light.ICON},
                  }}
                  titleStyle={{
                    color: darkModeFromStore
                      ? COLOR.dark.alertColor
                      : COLOR.light.alertColor,
                  }}
                  style={styles.accordionContentItem}
                  onPress={() => handleOpenAcceptModal()}
                />
              )}
            </List.Accordion>
          </List.AccordionGroup>

          <View style={styles.buttonsItem}>
            <Button
              mode="elevated"
              textColor={COLOR.dark.TEXT_BRIGHT}
              buttonColor={
                darkModeFromStore
                  ? COLOR.dark.BUTTON_COLOR
                  : COLOR.light.BUTTON_COLOR
              }
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
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderRadius: 8,
      backgroundColor: 'rgba(0, 240, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(0,240,255,0.2)',
    },
    flexText: {
      flex: 1,
      flexWrap: 'wrap',
      marginRight: 10,
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
    fullWidthButton: {
      width: '100%',
      alignItems: 'flex-start',
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
