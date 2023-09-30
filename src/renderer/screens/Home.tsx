import { NumberTag } from 'exifreader';
import React, { FormEvent, useEffect, useRef, useState } from 'react';

export type ImageType = {
  fullPath: string;
  name: string;
  dir: string;
  base64: string;
  type: string;
  micro: number;
  orientation: undefined | NumberTag;
};

const Images = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  useEffect(() => {
    window.electron.ipcRenderer.on('images', (args) => {
      if (Array.isArray(args)) {
        setImages((prev) => [...args, ...prev]);
      }
    });
  }, []);
  return images.map((image: ImageType) => {
    const { orientation } = image;
    if (orientation && !/[1386]/.test(orientation.value.toString())) {
      console.log(image.orientation);
    }
    let rotate = orientation?.value === 6 ? 'rotate90' : '';
    rotate = orientation?.value === 8 ? 'rotateNeg90' : rotate;
    rotate = orientation?.value === 3 ? 'rotate180' : rotate;
    return (
      <div>
        <img
          className={`${rotate}`}
          key={image.fullPath}
          src={`data:${image.type};base64, ${image.base64}`}
          alt={image.name}
        />
      </div>
    );
  });
};

const Home = () => {
  console.log('starting');
  const status = useRef('');

  useEffect(() => {
    window.electron.ipcRenderer.on('status', (args: unknown) => {
      console.log('received status', args);
      status.current = args as string;
    });
    window.electron.ipcRenderer.on('getImages', (args) => {
      console.log('getImages', args);
    });
  }, []);

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = event.currentTarget;
    if (status.current === 'paused') {
      window.electron.ipcRenderer.sendMessage('action', name);
    } else {
      console.log('onClick', status.current);
    }
  };

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const formData = new FormData(form);

    const formJson = Object.fromEntries(formData.entries());
    if (status.current !== 'running') {
      window.electron.ipcRenderer.sendMessage('getImages', [formJson]);
    } else {
      console.log({ status: status.current });
    }
  };

  return (
    <>
      <div id="controls">
        <div>
          <button name="continue" type="button" onClick={onClick}>
            Continue
          </button>
          <button name="cancel" type="button" onClick={onClick}>
            Cancel
          </button>
        </div>
        <form method="post" onSubmit={handleSubmit}>
          <input type="text" name="path" placeholder="pathToPhotos/" />
          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="image-container">
        <Images />
      </div>
    </>
  );
};

export default Home;
