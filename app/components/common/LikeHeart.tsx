// components/LikeHeart.tsx

import { FC } from "react";
import { Heart } from "lucide-react"; // Importando o ícone Heart do Lucide

interface Props {
  busy?: boolean;
  label?: string;
  liked?: boolean;
  onClick?(): void;
}

const LikeHeart: FC<Props> = ({
  liked = false,
  label,
  onClick,
}): JSX.Element => {
  return (
    <button
      type="button"
      className="flex items-center space-x-2 outline-none focus:outline-none"
      onClick={onClick}
      aria-label={liked ? "Descurtir comentário" : "Curtir comentário"}
    >
      <Heart
        size={16}
        color={liked ? "#FF4D4F" : "#6B7280"} // Vermelho para curtido, cinza para não curtido
        className={`transition-colors duration-200 ${
          liked ? "fill-current" : "stroke-current"
        }`}
      />
      <span className="text-primary-dark dark:text-primary">{label}</span>
    </button>
  );
};

export default LikeHeart;
