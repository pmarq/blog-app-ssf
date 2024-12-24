// app/lib/utils.ts

import { Post } from "@/app/models/Post";
import { PostDetail } from "@/app/utils/types";

export const formatPost = (post: Post): PostDetail => {
  return {
    title: post.title,
    slug: post.slug,
    meta: post.meta,
    tags: post.tags,
    thumbnail: post.thumbnail?.url || "",
    createdAt: post.createdAt.toDate().toISOString(),
  };
};
