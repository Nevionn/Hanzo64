import {usePhotoRequest} from './usePhotoRequest';
import {useAlbumsRequest} from './useAlbumsRequest';

// хук для получения количества всех существующих альбомов и фотографий

const useMediaInformation = () => {
  const {getCountPhotos} = usePhotoRequest();
  const {getCountAlbums} = useAlbumsRequest();

  const calcAllAlbums = () => {
    return getCountAlbums();
  };

  const calcAllPhotos = () => {
    return getCountPhotos();
  };

  return {
    calcAllAlbums,
    calcAllPhotos,
  };
};

export default useMediaInformation;
