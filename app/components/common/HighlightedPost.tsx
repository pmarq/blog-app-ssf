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
  const { title, slug, meta, createdAt, tags, thumbnail } = post;

  return (
    <div className="w-full max-w-7xl rounded-4xl overflow-hidden bg-primary dark:bg-primary-dark mx-auto">
      <Link
        href={`/posts/${slug}`}
        className="flex flex-col md:flex-row no-underline text-inherit"
      >
        {/* Thumbnail */}
        <div className="md:w-3/4 relative h-[350px] overflow-hidden">
          {!thumbnail || !thumbnail.url ? (
            <div className="w-full h-full flex items-center justify-center text-secondary-dark opacity-50 font-semibold rounded-2xl">
              No image
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={thumbnail.url}
                alt={`Thumbnail for ${title}`}
                layout="fill"
                objectFit="cover"
                className="rounded-2xl transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Informações do Post */}
        <div className="p-12 mt-6 md:mt-0 flex flex-col justify-between md:w-3/4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-base text-secondary-dark">
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
                    className="text-base text-blue-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <h2 className="text-4xl font-semibold text-primary-dark dark:text-primary mb-4">
              {trimText(title, 60)}
            </h2>
            <p className="text-lg text-secondary-dark mb-6">
              {trimText(meta, 100)}
            </p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Ler Mais &rarr;
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HighlightedPost;
