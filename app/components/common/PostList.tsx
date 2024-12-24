// app/admin/posts/PostsList.tsx

import React from "react";
import { PostDetail } from "@/app/utils/types";
import InfiniteScrollPosts from "./InfiniteScrollPosts";

interface PostsListProps {
  posts: PostDetail[];
  loadMorePosts: () => Promise<void>;
  hasMorePosts: boolean;
}

const PostsList: React.FC<PostsListProps> = ({
  posts,
  loadMorePosts,
  hasMorePosts,
}) => {
  return (
    <InfiniteScrollPosts
      posts={posts}
      showControls={true}
      hasMore={hasMorePosts}
      next={loadMorePosts}
      dataLength={posts.length}
      loader={<h4>Carregando...</h4>}
    />
  );
};

export default PostsList;
