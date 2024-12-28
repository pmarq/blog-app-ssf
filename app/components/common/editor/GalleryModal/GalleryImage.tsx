// components/GalleryImage.tsx
import { FC } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import CheckMark from "../../CheckMark";

interface Props extends Omit<NextImageProps, 'alt'> {
  alt: string; // Definimos 'alt' explicitamente
  selected?: boolean;
  onClick?(): void;
}

const GalleryImage: FC<Props> = ({ src, alt, selected, onClick, ...rest }): JSX.Element | null => {
  console.log(`GalleryImage recebendo src: "${src}", alt: "${alt}"`); // Adicione este log

  if (!src) {
    console.warn("GalleryImage component received an empty src.");
    return (
      <div
        onClick={onClick}
        className="relative rounded overflow-hidden cursor-pointer bg-gray-200 flex items-center justify-center"
      >
        <span className="text-gray-500">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="relative rounded overflow-hidden cursor-pointer"
    >
      <NextImage
        src={src}
        alt={alt} // Passamos 'alt' explicitamente
        className={`bg-secondary-light hover:scale-110 transition object-cover ${rest.className || ""}`}
        {...rest} // Propagamos as outras props, excluindo 'alt'
      />
      <div className="absolute top-2 left-2">
        <CheckMark visible={selected || false} />
      </div>
    </div>
  );
};

export default GalleryImage;
