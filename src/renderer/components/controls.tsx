import React, { FormEvent } from 'react';
import useImagesContext from '../context/useImagesContext';

const Controls = () => {
  const { status } = useImagesContext();
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
  );
};

export default Controls;
