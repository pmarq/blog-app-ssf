// components/ThumbnailSelector.tsx
"use client";

import { Thumbnail } from "@/app/models/Post";
import classNames from "classnames";
import { ChangeEventHandler, FC, useEffect, useState } from "react";

interface Props {
  initialValue?: string | Thumbnail;
  onChange(file: File): void;
}

const commonClass =
  "border border-dashed border-secondary-dark flex items-center justify-center rounded cursor-pointer aspect-video";

const ThumbnailSelector: FC<Props> = ({
  initialValue,
  onChange,
}): JSX.Element => {
  const [selectedThumbnail, setSelectedThumbnail] = useState<
    string | undefined
  >(undefined);
  const [objectURL, setObjectURL] = useState<string | undefined>(undefined);

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { files } = target;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 1 * 1024 * 1024; // 1MB

    if (!validTypes.includes(file.type)) {
      alert("Por favor, selecione uma imagem válida (JPG, PNG ou GIF).");
      return;
    }

    if (file.size > maxSize) {
      alert(
        "A imagem selecionada é muito grande. O tamanho máximo permitido é de 5MB."
      );
      return;
    }

    // Limpar a URL anterior, se existir
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
    }

    const newObjectURL = URL.createObjectURL(file);
    setSelectedThumbnail(newObjectURL);
    setObjectURL(newObjectURL);
    onChange(file);
  };

  useEffect(() => {
    if (typeof initialValue === "string") {
      setSelectedThumbnail(initialValue);
    } else if (initialValue && "url" in initialValue) {
      setSelectedThumbnail(initialValue.url);
    }

    return () => {
      if (objectURL) {
        URL.revokeObjectURL(objectURL);
      }
    };
  }, [initialValue, objectURL]);

  return (
    <div className="w-32">
      <input
        type="file"
        hidden
        accept="image/jpg, image/png, image/jpeg, image/gif"
        id="thumbnail"
        onChange={handleChange}
      />
      <label htmlFor="thumbnail">
        {selectedThumbnail ? (
          <img
            src={selectedThumbnail}
            alt="Thumbnail"
            className={classNames(commonClass, "object-cover")}
          />
        ) : (
          <PosterUI label="Thumbnail" />
        )}
      </label>
    </div>
  );
};

const PosterUI: FC<{ label: string; className?: string }> = ({
  label,
  className,
}) => {
  return (
    <div className={classNames(commonClass, className)}>
      <span>{label}</span>
    </div>
  );
};

export default ThumbnailSelector;
