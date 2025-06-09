// app/components/common/PostCard.tsx

"use client";

import Image from "next/image";
import { FC } from "react";
import dateformat from "dateformat";
import Link from "next/link";
import { PostDetail } from "@/app/utils/types";
import { Loader2 } from "lucide-react";
import { Badge } from "./Badge";

interface Props {
  post: PostDetail;
  busy?: boolean;
  controls?: boolean;
  onDeleteClick?(): void;
}

const trimText = (text: string, trimBy: number) => {
  if (text.length <= trimBy) return text;
  return text.substring(0, trimBy).trim() + "...";
};

function formatDatePtBr(date: Date) {
  const partes = date
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .split(" de ");
  return `${partes[0]}-${partes[1][0].toUpperCase()}${partes[1].slice(1)}-${
    partes[2]
  }`;
}

const PostCard: FC<Props> = ({
  controls = false,
  post,
  busy,
  onDeleteClick,
}): JSX.Element => {
  const { title, meta, categoryTitle, createdAt, tags, thumbnail } = post;

  return (
    <div className="rounded shadow-sm shadow-secondary-dark overflow-hidden bg-primary dark:bg-primary-dark transition flex flex-col h-full">
      {/* Thumbnail */}
      <div className="aspect-video relative">
        {!thumbnail || !thumbnail.url ? (
          <div className="w-full h-full flex items-center justify-center text-secondary-dark opacity-50 font-semibold">
            No image
          </div>
        ) : (
          <Image
            src={thumbnail.url}
            fill
            alt={`Thumbnail for ${title}`}
            className="object-cover rounded-2xl"
          />
        )}
      </div>

      {/* Informações do Post */}

      <div className="p-2 flex-1 flex flex-col">
        {/* Categoria + Data na mesma linha */}
        <div className="flex justify-between items-center mb-2">
          <Badge variant="neutral" className="w-fit text-sm">
            {categoryTitle}
          </Badge>
          <span className="text-sm text-sky-600">
            {formatDatePtBr(new Date(createdAt))}
          </span>
        </div>

        <Link
          href={`/${post.categorySlug}/${post.slug}`}
          className="flex flex-col flex-1"
        >
          {/* Tags */}
          <div className="flex items-center justify-between text-xs text-sky-950 mb-2">
            <div className="flex flex-wrap items-center space-x-1">
              {tags.map((t, index) => (
                <span key={`${t}-${index}`}>#{t}</span>
              ))}
            </div>
          </div>

          {/* Título e descrição */}
          <h1 className="font-semibold text-sky-950 mb-1">
            {trimText(title, 50)}
          </h1>
          <p className="text-sky-900 !text-[14px] mb-2">{trimText(meta, 70)}</p>
        </Link>

        {controls && (
          <div className="flex justify-end items-center h-8 mt-auto space-x-4 text-primary-dark dark:text-primary">
            {busy ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                <span>Removendo...</span>
              </div>
            ) : (
              <>
                <Link
                  href={`/dashboard/posts/update/${post.id}`}
                  className="hover:underline"
                >
                  Editar
                </Link>
                <button onClick={onDeleteClick} className="hover:underline">
                  Deletar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
