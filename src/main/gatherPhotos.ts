/* eslint-disable promise/always-return */
/* eslint-disable no-restricted-syntax */
import { IpcMainEvent, ipcMain } from 'electron';
import ExifReader, { ExifTags, ThumbnailTags } from 'exifreader';
import path from 'node:path';
import fs from 'node:fs';
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
      if (!/\.(jpe?g|tiff|gif)$/i.test(file.name)) {
        console.error({ err: fullPath });
        yield Promise.resolve(undefined);
      } else {
        const exifData = ExifReader.load(fullPath, {
          includeUnknown: true,
          expanded: true,
        });
        const imgData = exifData
          .then((data) => {
            const { base64, type } = data.Thumbnail as ThumbnailTags;
            const { Orientation: orientation } = data.exif as ExifTags;
            return {
              name: file.name,
              fullPath,
              dir,
              orientation,
              base64,
              type,
            };
          })
          .catch(() => {
            console.error({ err: fullPath });
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
  console.log({ status });
  if (!fs.existsSync(imagePath) || status) return '1';
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
  console.log('func');
  ipcMain.on('action', (evt, action) => {
    console.log('action', action);
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
