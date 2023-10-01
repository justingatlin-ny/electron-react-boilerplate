import { NumberTag } from 'exifreader';
import { ImagesProvider } from '../context/useImagesContext';
import Controls from '../components/controls';
import Images from '../components/images';

export type ImageType = {
  fullPath: string;
  name: string;
  dir: string;
  base64: string;
  type: string;
  micro: number;
  orientation: undefined | NumberTag;
};

const Home = () => {
  console.log('starting');

  return (
    <ImagesProvider>
      <>
        <Controls />
        <div className="image-container">
          <Images />
        </div>
      </>
    </ImagesProvider>
  );
};

export default Home;
