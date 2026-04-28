// app/components/common/HighlightedPost.tsx

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PostDetail } from "@/app/utils/types"; // Assegure-se de que o tipo está corretamente definido

interface HighlightedPostProps {
  post: PostDetail;
}

const trimText = (text: string, trimBy: number) => {
  if (text.length <= trimBy) return text;
  return text.substring(0, trimBy).trim() + "...";
};

const HighlightedPost: React.FC<HighlightedPostProps> = ({ post }) => {
  const { title, meta, createdAt, tags, thumbnail } = post;

  return (
    <div className="w-full max-w-7xl rounded-4xl overflow-hidden bg-primary dark:bg-primary-dark mx-auto">
      <Link
        href={`/${post.categorySlug}/${post.slug}`}
        className="flex flex-col md:flex-row no-underline text-inherit"
      >
        {/* Thumbnail */}
        <div className="md:w-3/4 relative h-[230px] sm:h-[2500px] md:h-[350px] overflow-hidden">
          {!thumbnail || !thumbnail.url ? (
            <div className="w-full h-full flex items-center justify-center text-secondary-dark opacity-50 font-semibold rounded-2xl">
              No image
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={thumbnail.url}
                alt={`Thumbnail for ${title}`}
                fill
                className="rounded-2xl transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Informações do Post */}
        <div className="p-4 mt-6 md:mt-0 flex flex-col justify-between md:w-3/4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs md:text-base text-primary">
                {new Date(createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <div className="flex flex-wrap items-center space-x-2">
                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="text-xs md:text-base text-accent"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {trimText(title, 60)}
            </h2>
            <p className="text-base text-muted-foreground mb-2">{trimText(meta, 200)}</p>
          </div>
          <div>
            <span className="text-primary hover:opacity-80 dark:text-primary hover:underline font-semibold transition">
              Ler Mais &rarr;
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HighlightedPost;
