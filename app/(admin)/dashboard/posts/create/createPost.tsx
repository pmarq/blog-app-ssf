// app/dashboard/posts/create/page.tsx

"use client";

import React, { useState } from "react";
import EditorComponent, { FinalPost } from "@/app/components/common/editor";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth"; // Import do contexto de autenticação
import { useToast } from "@/hooks/use-toast"; // Import do hook de toast
import { createPost } from "../action"; // Import apenas da função createPost

export default function CreatePost() {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { currentUser } = useAuth(); // Obtém o usuário atual
  const userId = currentUser?.uid; // Obtém o ID do usuário
  const { toast } = useToast();

  const handleOnSubmit = async (post: FinalPost) => {
    if (!userId) {
      setErrorMessage("Usuário não autenticado.");
      return;
    }

    setBusy(true);
    setErrorMessage("");

    try {
      // 1) Monta objeto base incluindo a thumbnail
      const postData = {
        ...post,
        images: [], // Não vamos mandar nada do conteúdo
        tags: post.tagsArray || [],
        slug: post.slug || "", // Assegure-se de que o slug está presente
        meta: post.meta || "",
        authorId: userId, // Passa o authorId para a ação server
        thumbnail: post.thumbnail, // Inclui o File da thumbnail (já foi upload no Editor)
      };

      // 2) Cria o post no Firestore e gerencia o upload da thumbnail no servidor
      const response = await createPost(postData, userId);
      if (response.error || !response.postId) {
        throw new Error(response.message || "Falha ao criar o post.");
      }

      // 3) Sucesso
      toast({
        title: "Sucesso!",
        description: "Post criado com sucesso!",
        variant: "default",
      });
      router.push("/dashboard/posts");
    } catch (error: any) {
      console.error("Erro ao criar o post:", error);
      setErrorMessage(
        error.message || "Ocorreu um erro ao criar o post."
      );
      toast({
        title: "Erro!",
        description: error.message || "Ocorreu um erro ao criar o post.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <EditorComponent onSubmit={handleOnSubmit} busy={busy} />
    </div>
  );
}
