/* eslint-disable promise/always-return */
/* eslint-disable no-restricted-syntax */
import { IpcMainEvent, ipcMain } from 'electron';
import ExifReader, { ExifTags, ThumbnailTags } from 'exifreader';
import path from 'node:path';
import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import imghash from 'imghash';

import { ImageType } from '../renderer/screens/Home';

export function* readAllFiles(
  event: IpcMainEvent,
  dir: string,
): Generator<Promise<any>> {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const directory = path.join(dir, file.name);
      yield* readAllFiles(event, directory);
    } else {
      const fullPath = path.join(dir, file.name);
      if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
        yield Promise.resolve(undefined);
      } else {
        const exifData = ExifReader.load(fullPath, {
          includeUnknown: true,
          expanded: true,
        });
        const imgData = exifData
          .then(({ Thumbnail, exif }) => {
            const { type, image } = Thumbnail as ThumbnailTags;
            const {
              Orientation: orientation,
              PixelXDimension,
              PixelYDimension,
            } = exif as ExifTags;
            return {
              name: file.name,
              fullPath,
              dir,
              orientation,
              image: Buffer.from(image),
              type,
              width: PixelXDimension?.value,
              height: PixelYDimension?.value,
            };
          })
          .then(async (obj) => {
            const hash = await imghash.hash(obj.image, 8, 'binary');
            const base64 = Buffer.from(obj.image).toString('base64');
            return { ...obj, hash, base64 };
          })
          .catch((err) => {
            console.error({ err });
            return undefined;
          });

        yield imgData;
      }
    }
  }
}
let status: string = '';
const max = 50;
const getImages = async (event: IpcMainEvent, imagePath: string) => {
  if (!fs.existsSync(imagePath) || status) {
    return event.reply('getImages', 'path does not exist');
  }
  event.reply('getImages', 'invoked');
  let imagesList: ImageType[] = [];

  const iterator = readAllFiles(event, imagePath);

  let isDone: boolean | undefined;
  status = 'initializing';
  event.reply('status', status);

  const nextTraunch = async () => {
    status = 'running';
    event.reply('status', status);
    while (!isDone && imagesList.length < max) {
      const { done, value } = iterator.next();
      // eslint-disable-next-line no-await-in-loop
      const v = await value;
      if (v !== undefined) {
        imagesList.push(v);
      }
      isDone = done;
    }
    event.reply('images', imagesList);
    status = isDone ? 'done' : 'paused';
    event.reply('status', status);
    imagesList = [];
    if (isDone) {
      status = '';
    }
  };
  ipcMain.on('action', (evt, action) => {
    if (action === 'continue') {
      evt.reply('status', action);
      if (status === 'paused') {
        nextTraunch();
      }
    }
    if (action === 'cancel') {
      iterator.return(action);
      evt.reply('status', action);
      status = '';
    }
  });
  if (/initializing|done|cancel/.test(status)) {
    nextTraunch();
  }
  if (status === 'done') {
    status = '';
    return 'done';
  }
};

export default getImages;
