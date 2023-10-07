import React from 'react';
import useImagesContext, { ImageType } from '../context/useImagesContext';

const Images = ({ findDistance }) => {
  const { imagesList } = useImagesContext();
  const onClick = ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => {
    const attr = currentTarget.getAttribute('data-active');
    document.querySelectorAll('[data-active="true"]').forEach((elm, key) => {
      if (key > 0) {
        elm.setAttribute('data-active', 'false');
      }
    });
    currentTarget.setAttribute(
      'data-active',
      attr && attr === 'true' ? 'false' : 'true',
    );
    const elms = document.querySelectorAll('[data-active="true"]');
    if (elms.length === 2) {
      findDistance(elms);
    }
  };
  return imagesList.map((image: ImageType) => {
    const { orientation } = image;
    if (orientation && !/[1386]/.test(orientation.value.toString())) {
      console.log('uncaught orientation', image.fullPath, image.orientation);
    }
    let rotate = orientation?.value === 6 ? 'rotate90' : '';
    rotate = orientation?.value === 8 ? 'rotateNeg90' : rotate;
    rotate = orientation?.value === 3 ? 'rotate180' : rotate;
    return (
      <button
        type="button"
        key={image.fullPath}
        onClick={onClick}
        data-hash={image.hash}
      >
        <img
          className={`${rotate}`}
          src={`data:${image.type};base64, ${image.base64}`}
          alt={image.name}
        />
      </button>
    );
  });
};

export default Images;
