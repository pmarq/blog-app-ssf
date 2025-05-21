// app/(admin)/dashboard/page.tsx

import React from "react";
import AdminLayout from "@/app/components/layout/AdminLayout";
import ContentWrapper from "@/app/components/admin/ContentWrapper";
import LatestPostListCard from "@/app/components/admin/LatestPostListCard";
import LatestCommentListCard from "@/app/components/admin/LatestCommentListCard";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import { fetchLatestComments } from "@/lib/fetchComments";

export default async function AdminDashboard() {
  const limit = 5;

  // Buscar os dados em paralelo para otimizar o tempo de resposta
  const [postsData, commentsData /* usersData */] = await Promise.all([
    fetchInitialPosts(limit),
    fetchLatestComments(limit),
    /* fetchLatestUsers(limit), */
  ]);

  const {
    posts,
    lastVisibleId: postsLastVisibleId,
    hasMore: postsHasMore,
  } = postsData;
  const { comments } = commentsData;
  /*   const { users } = usersData; */

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-10">
        {/* Seção de Posts e Comentários */}
        <div className="flex space-x-10">
          {/* Últimos Posts */}
          <ContentWrapper seeAllRoute="/admin/posts" title="Últimos Posts">
            {posts.map(({ id, title, meta, slug }) => (
              <LatestPostListCard
                key={id}
                title={title}
                meta={meta}
                slug={slug}
              />
            ))}
          </ContentWrapper>

          {/* Últimos Comentários */}
          <ContentWrapper
            seeAllRoute="/admin/comments"
            title="Últimos Comentários"
          >
            {comments.map((comment) => (
              <LatestCommentListCard comment={comment} key={comment.id} />
            ))}
          </ContentWrapper>
        </div>

        {/* Seção de Usuários */}
        <div className="max-w-full">
          <ContentWrapper title="Últimos Usuários" seeAllRoute="/admin/users">
            {/*  <LatestUserTable users={users} /> */}
            <>Users</>
          </ContentWrapper>
        </div>
      </div>
    </AdminLayout>
  );
}
