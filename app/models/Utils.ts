// app/lib/utils.ts

import { Post } from "@/app/models/Post";
import { PostDetail } from "@/app/utils/types";

export const formatPost = (post: Post): PostDetail => {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    meta: post.meta,
    tags: post.tags,
    content: post.content,
    thumbnail: post.thumbnail || null, // <-- Corrigido aqui
    createdAt: post.createdAt.toDate().toISOString(),
    categorySlug: post.categorySlug,
    categoryTitle: post.categoryTitle,
    categoryId: post.category?.id || "", // se category for referência
  };
};
