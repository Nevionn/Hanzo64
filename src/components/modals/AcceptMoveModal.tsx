import React from 'react';
import {View, Text, StyleSheet, Modal, StatusBar} from 'react-native';
import {useAppSettings, setButtonColor} from '../../../assets/settingsContext';
import {COLOR} from '../../../assets/colorTheme';
import {Button} from 'react-native-paper';
import SvgAlert from '../icons/SvgAlert';

interface AcceptMoveModalProps {
  visible: boolean;
  onCloseAcceptModal: () => void;
  onConfirm: () => void;
  title: string;
  textBody: string;
}

const AcceptMoveModal: React.FC<AcceptMoveModalProps> = ({
  visible,
  onCloseAcceptModal,
  onConfirm,
  title,
  textBody,
}) => {
  const {appSettings} = useAppSettings();

  const styles = getStyles(appSettings.darkMode);
  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onCloseAcceptModal}>
        <StatusBar translucent backgroundColor="black" />
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.textItem}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.topSpacer} />
              <View style={styles.centerItemContent}>
                <SvgAlert />
                <Text style={styles.text}>{textBody}</Text>
              </View>
            </View>
            <View style={styles.buttonsItem}>
              <Button
                mode="elevated"
                textColor={COLOR.dark.TEXT_BRIGHT}
                style={styles.button}
                buttonColor={setButtonColor(appSettings.darkMode)}
                onPress={() => onConfirm()}>
                Удалить
              </Button>
              <Button
                mode="elevated"
                textColor={COLOR.dark.TEXT_BRIGHT}
                buttonColor={setButtonColor(appSettings.darkMode)}
                onPress={() => onCloseAcceptModal()}>
                Отмена
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
      width: '88%',
      backgroundColor: darkMode
        ? COLOR.dark.SECONDARY_COLOR
        : COLOR.light.SECONDARY_COLOR,
      padding: 20,
      borderRadius: 8,
    },
    topSpacer: {
      height: 20,
    },
    textItem: {},
    buttonsItem: {
      justifyContent: 'flex-end',
      flexDirection: 'row',
      marginTop: 40,
    },
    centerItemContent: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    button: {
      marginHorizontal: 14,
    },
    title: {
      textAlign: 'left',
      fontSize: 18,
      color: darkMode ? COLOR.dark.TEXT_BRIGHT : COLOR.light.TEXT_BRIGHT,
    },
    text: {
      textAlign: 'left',
      flexWrap: 'wrap',
      maxWidth: '86%',
      color: darkMode ? COLOR.dark.TEXT_DIM : COLOR.light.TEXT_DIM,
    },
  });
};

export default AcceptMoveModal;
