// app/admin/posts/PostsList.tsx

import React from "react";
import { PostDetail } from "@/app/utils/types";
import InfiniteScrollPosts from "./InfiniteScrollPosts";

interface PostsListProps {
  posts: PostDetail[];
  loadMorePosts: () => Promise<void>;
  hasMorePosts: boolean;
  onDeleteClick: (post: PostDetail) => void; // Adiciona esta linha
  showControls?: boolean;
}

const PostsList: React.FC<PostsListProps> = ({
  posts,
  loadMorePosts,
  hasMorePosts,
  onDeleteClick, // Adiciona esta linha
  showControls = false, // Valor padrão
}) => {
  return (
    <InfiniteScrollPosts
      posts={posts}
      showControls={showControls}
      hasMore={hasMorePosts}
      next={loadMorePosts}
      dataLength={posts.length}
      loader={<h4>Carregando...</h4>}
      onDeleteClick={onDeleteClick} // Passe a prop para InfiniteScrollPosts
    />
  );
};

export default PostsList;
