import { NumberTag } from 'exifreader';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface IImagesProvider {
  children: React.ReactNode;
}

export type ImageType = {
  fullPath: string;
  name: string;
  dir: string;
  image: ArrayBuffer;
  width: string;
  height: string;
  base64: string;
  type: string;
  micro: number;
  orientation: undefined | NumberTag;
  hash: string;
};

interface IImagesContext {
  status: React.MutableRefObject<string>;
  imagesList: ImageType[];
}

const ImagesContext = createContext({} as IImagesContext);

export const ImagesProvider = ({ children }: IImagesProvider) => {
  const [imagesList, setImages] = useState<ImageType[]>([]);
  const status = useRef<string>('');
  useEffect(() => {
    window.electron.ipcRenderer.on('status', (args: unknown) => {
      console.log('received status', args);
      status.current = args as string;
    });
    window.electron.ipcRenderer.on('getImages', (args) => {
      console.log('getImages', args);
    });
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on('images', (args) => {
      if (Array.isArray(args)) {
        setImages((prev) => [...args, ...prev]);
      }
    });
  }, []);

  const memoized = useMemo(
    () => ({
      imagesList,
      status,
    }),
    [imagesList],
  );

  return (
    <ImagesContext.Provider value={memoized}>{children}</ImagesContext.Provider>
  );
};

const useImagesContext = () => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error(
      `${useImagesContext.name} must be used in ${ImagesProvider.name}`,
    );
  }
  return context;
};

export default useImagesContext;
