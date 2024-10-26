import React, {useState} from 'react';
import {View, Text, Switch, StyleSheet, Modal} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Button} from 'react-native-paper';
import {COLOR} from '../../../assets/colorTheme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

interface Settings {
  darkMode: boolean;
  sortOrder: 'newest' | 'oldest';
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    sortOrder: 'newest',
  });

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Настройки</Text>

          <View style={styles.setting}>
            <Text>Темная тема</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSwitch('darkMode')}
            />
          </View>

          <View style={styles.sortItem}>
            <Text>Сортировка</Text>
            <Picker
              selectedValue={settings.sortOrder}
              style={styles.pickerItem}
              onValueChange={itemValue =>
                setSettings(prevSettings => ({
                  ...prevSettings,
                  sortOrder: itemValue as 'newest' | 'oldest',
                }))
              }>
              <Picker.Item label="Новые альбомы" value="newest" />
              <Picker.Item label="Старые альбомы" value="oldest" />
            </Picker>
          </View>

          <View style={styles.buttonsItem}>
            <Button mode="contained" onPress={handleSave}>
              Сохранить
            </Button>
            <Button mode="contained" onPress={onClose}>
              Отмена
            </Button>
          </View>
        </View>
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
    backgroundColor: COLOR.SECONDARY_COLOR,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  pickerItem: {
    height: 50,
    width: 190,
  },
  buttonsItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default SettingsModal;
