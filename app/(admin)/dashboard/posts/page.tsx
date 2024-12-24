// app/(admin)/dashboard/posts/page.tsx

import React from "react";
import AdminLayout from "@/app/components/layout/AdminLayout";
import PostsListWrapper from "@/app/components/common/PostListWrapper";
import fetchInitialPosts from "@/lib/fetchPosts";

export default async function Posts() {
  const limit = 9;

  // Dados iniciais vindos do servidor
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);
  console.log(posts)

  return (
    <AdminLayout>
      <PostsListWrapper
        initialPosts={posts}
        initialLastVisibleId={lastVisibleId}
      />
    </AdminLayout>
  );
}
