// components/Gallery.tsx
import { FC } from "react";
import { BsCardImage } from "react-icons/bs";
import GalleryImage from "./GalleryImage";

interface Props {
  images: { src: string; alt?: string }[];
  onSelect(src: string): void;
  uploading?: boolean;
  selectedImage?: string;
}

const Gallery: FC<Props> = ({
  images,
  uploading = false,
  selectedImage = "",
  onSelect,
}): JSX.Element => {
  return (
    <div className="flex flex-wrap">
      {uploading && (
        <div className="basis-1/4 p-2 aspect-square flex flex-col items-center justify-center bg-secondary-light text-primary-dark rounded animate-pulse">
          <BsCardImage size={60} />
          <p>Uploading</p>
        </div>
      )}
      {images.map(({ src, alt }, index) => {
        console.log(`Renderizando imagem ${index + 1} com src: ${src}, alt: ${alt}`); // Adicione este log
        return (
          <div key={index} className="basis-1/4 p-2">
            <GalleryImage
              src={src}
              alt={alt || `Image ${index + 1}`}
              selected={selectedImage === src}
              onClick={() => onSelect(src)}
              width={200}
              height={200}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;

