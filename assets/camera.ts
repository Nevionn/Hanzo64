import {launchImageLibrary} from 'react-native-image-picker';
import eventEmitter from './eventEmitter';

interface AddPhotoParams {
  album_id: string;
  title: string | undefined;
  photo: string;
  created_at: string;
}

export const pickImage = async (
  idAlbum: string,
  addPhoto: (photo: AddPhotoParams) => void,
) => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets && result.assets.length > 0) {
      const {base64, fileName} = result.assets[0];

      if (base64) {
        addPhoto({
          album_id: idAlbum,
          title: fileName,
          photo: base64,
          created_at: new Date().toLocaleString(),
        });
        eventEmitter.emit('photosUpdated');
        eventEmitter.emit('albumsUpdated');
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
  }
};
