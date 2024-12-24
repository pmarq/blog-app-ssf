// app/dashboard/posts/create/page.tsx
"use client";

import React, { useState } from "react";
import EditorComponent, { FinalPost } from "@/app/components/common/editor";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth"; // Import do contexto de autenticação
import { useToast } from "@/hooks/use-toast"; // Import do hook de toast
import { createPost, savePostImages } from "../action";

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
      // 1) Monta objeto base (sem imagens do editor, pois já foram enviadas imediatamente)
      const postData = {
        ...post,
        images: [], // Não vamos mandar nada do conteúdo
        tags: post.tagsArray || [],
        slug: post.slug || "", // Assegure-se de que o slug está presente
        meta: post.meta || "",
      };

      // 2) Cria o post no Firestore e obtém ID (server action)
      const response = await createPost(postData, userId);
      if (response.error || !response.postId) {
        throw new Error(response.message || "Falha ao criar o post.");
      }
      const { postId } = response;

      // 3) Se houver thumbnail (File), faz upload no CLIENTE usando Cloudinary
      let urls: string[] = [];
      if (post.thumbnail instanceof File) {
        const file = post.thumbnail;

        // Monta form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
        );
        // Define a pasta para thumbnails do post
        formData.append("folder", `posts/${postId}`);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (!data.secure_url) {
          throw new Error("Falha ao fazer upload do thumbnail no Cloudinary.");
        }
        // Salva a URL final
        urls.push(data.secure_url);
      }

      // 4) Se subimos o thumbnail, salva URL no Firestore
      if (urls.length > 0) {
        const saveResponse = await savePostImages({ postId, paths: urls });
        if (saveResponse.error) {
          throw new Error(
            saveResponse.message || "Falha ao salvar imagens do post."
          );
        }
      }

      // 5) Sucesso
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
