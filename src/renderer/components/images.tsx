import useImagesContext, { ImageType } from '../context/useImagesContext';

const Images = () => {
  const { imagesList } = useImagesContext();

  return imagesList.map((image: ImageType) => {
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

export default Images;
