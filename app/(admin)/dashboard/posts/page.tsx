// app/(admin)/dashboard/posts/page.tsx
export const dynamic = "force-dynamic";

import React from "react";
import AdminLayout from "@/app/components/layout/AdminLayout";
import PostsListWrapper from "@/app/components/common/PostListWrapper";
import { fetchInitialPosts } from "@/lib/fetchPosts";

export default async function Posts() {
  const limit = 9;

  // Busca os posts iniciais diretamente no servidor
  const { posts, lastVisibleId, hasMore } = await fetchInitialPosts(limit);
  console.log(posts);

  return (
    <AdminLayout>
      <PostsListWrapper
        initialPosts={posts}
        initialLastVisibleId={lastVisibleId}
        hasMore={hasMore}
        showControls={true}
      />
    </AdminLayout>
  );
}
