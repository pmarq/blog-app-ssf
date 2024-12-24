// components/GalleryModal.tsx
"use client";

import Image from "next/image";
import { ChangeEventHandler, FC, useCallback, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import Gallery from "./Gallery";
import ModalContainer, { ModalProps } from "../../ModalContainer";
import ActionButton from "../../ActionButton";
import { useAuth } from "@/context/auth";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload"; // Import da função utilitária

export interface ImageSelectionResult {
  src: string;
  altText: string;
}

interface Props extends ModalProps {
  images: { src: string }[];
  uploading?: boolean;

  onFileSelect(imageUrl: string): void;
  onSelect(result: ImageSelectionResult): void;
}

const GalleryModal: FC<Props> = ({
  visible,
  uploading,
  images,
  onFileSelect,
  onSelect,
  onClose,
}): JSX.Element => {
  const [selectedImage, setSelectedImage] = useState("");
  const [altText, setAltText] = useState("");
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  const handleClose = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const handleOnImageChange: ChangeEventHandler<HTMLInputElement> = async ({ target }) => {
    const { files } = target;
    if (!files || !files[0]) return;

    const file = files[0];
    if (!file.type.startsWith("image")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      handleClose();
      return;
    }

    if (!userId) {
      alert("Usuário não autenticado.");
      handleClose();
      return;
    }

    try {
      // Define a pasta para armazenar a imagem na galeria do usuário
      const folder = `gallery/${userId}`;

      // Faz upload utilizando a função utilitária
      const imageUrl = await uploadToCloudinary(file, folder);

      console.log("Imagem enviada com sucesso:", imageUrl);

      // Atualiza a galeria com a nova imagem
      onFileSelect(imageUrl);
    } catch (error: any) {
      console.error("Erro ao subir arquivo:", error);
      alert("Falha ao fazer upload da imagem. Por favor, tente novamente.");
    }
  };

  const handleSelection = () => {
    if (!selectedImage) {
      handleClose();
      return;
    }
    onSelect({ src: selectedImage, altText });
    handleClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose}>
      <div className="max-w-4xl p-2 bg-primary-dark dark:bg-primary rounded">
        <div className="flex">
          <div className="basis-[75%] max-h-[450px] overflow-y-auto custom-scroll-bar">
            <Gallery
              images={images}
              selectedImage={selectedImage}
              uploading={uploading}
              onSelect={(src) => setSelectedImage(src)}
            />
          </div>

          <div className="basis-1/4 px-2">
            <div className="space-y-4">
              <div>
                <input
                  onChange={handleOnImageChange}
                  hidden
                  type="file"
                  id="image-input"
                  accept="image/*"
                />
                <label htmlFor="image-input">
                  <div className="w-full border-2 border-action text-action flex items-center justify-center space-x-2 p-2 cursor-pointer rounded">
                    <AiOutlineCloudUpload />
                    <span>Upload Image</span>
                  </div>
                </label>
              </div>

              {selectedImage ? (
                <>
                  <textarea
                    className="resize-none w-full bg-transparent rounded border-2 border-secondary-dark focus:ring-1 text-primary dark:text-primary-dark h-32 p-1"
                    placeholder="Alt text"
                    value={altText}
                    onChange={({ target }) => setAltText(target.value)}
                  />

                  <ActionButton onClick={handleSelection} title="Select" />

                  <div className="relative aspect-video bg-png-pattern">
                    <Image
                      src={selectedImage}
                      fill
                      alt={altText || "Selected image preview"}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default GalleryModal;

