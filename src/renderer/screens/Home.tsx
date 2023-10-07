import { useCallback, useState } from 'react';
import { NumberTag } from 'exifreader';
import leven from 'leven';
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
  const [distance, setDistance] = useState<number | 'null'>('null');

  const findDistance = useCallback((elms) => {
    if (elms.length === 2) {
      const hash1 = elms.item(0).getAttribute('data-hash');
      const hash2 = elms.item(1).getAttribute('data-hash');
      const num = leven(hash1, hash2);
      setDistance(num);
    } else {
      setDistance('null');
    }
  }, []);

  return (
    <ImagesProvider>
      <>
        <Controls distance={distance} />
        <div className="image-container">
          <Images findDistance={findDistance} />
        </div>
      </>
    </ImagesProvider>
  );
};

export default Home;
