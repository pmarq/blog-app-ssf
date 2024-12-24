// app/(admin)/dashboard/posts/update/EditorWrapper.tsx
"use client";

import React from "react";
import { PostResponse } from "@/app/models/Post";
import Editor, { FinalPost } from "@/app/components/common/editor";
import { updatePost } from "../../action";

interface EditorWrapperProps {
  post: PostResponse;
}

const EditorWrapper: React.FC<EditorWrapperProps> = ({ post }) => {
  const handleSubmit = async (updatedPost: FinalPost) => {
    try {
      await updatePost(post.id, updatedPost); // Use post.id (document ID)
      alert("Post atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o post:", error);
      alert("Falha ao atualizar o post.");
    }
  };

  // Ensure post conforms to FinalPost
  const initialValue: FinalPost = {
    ...post,
    thumbnail: post.thumbnail || undefined,
  };

  return (
    <Editor
      initialValue={initialValue}
      onSubmit={handleSubmit}
      btnTitle="Atualizar"
    />
  );
};

export default EditorWrapper;
