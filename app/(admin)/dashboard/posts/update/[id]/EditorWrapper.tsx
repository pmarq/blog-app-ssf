// app/(admin)/dashboard/posts/update/[id]/EditorWrapper.tsx

"use client";

import React, { useState } from "react";
import Editor, { FinalPost } from "@/app/components/common/editor";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PostDetail } from "@/app/utils/types";

interface EditorWrapperProps {
  post: PostDetail;
}

const EditorWrapper: React.FC<EditorWrapperProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  /* ── estado local do post ─────────────────── */
  const [localPost, setLocalPost] = useState<PostDetail>(post);

  // Estados para indicar carregamento e mensagens de erro
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Handle submit para atualizar o post.
   * @param updatedPost Os dados atualizados do post.
   */

  /* ---------- submit ---------- */
  const handleSubmit = async (updatedPost: FinalPost) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    setErrorMessage("");

    try {
      let thumbnailData: { url: string; public_id: string } | undefined =
        undefined;

      // Se houver nova thumbnail (File), faz upload usando signed uploads do Cloudinary
      if (updatedPost.thumbnail instanceof File) {
        // 1. Obter o token de autenticação
        const idToken = await currentUser.getIdToken();

        // 2. Solicitar a assinatura de upload ao servidor
        const folder = `posts/${post.id}`;
        const signatureResponse = await fetch(
          `/api/cloudinary/get-signature?folder=${encodeURIComponent(folder)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (!signatureResponse.ok) {
          const errorData = await signatureResponse.json();
          console.error("Erro ao obter assinatura:", errorData);
          throw new Error(
            errorData.message || "Falha ao obter assinatura para upload."
          );
        }

        const { timestamp, signature, api_key, cloud_name } =
          await signatureResponse.json();

        // 3. Preparar os dados para upload
        const formData = new FormData();
        formData.append("file", updatedPost.thumbnail);
        formData.append("api_key", api_key);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        // 4. Fazer o upload para Cloudinary
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          console.error(
            "Erro ao fazer upload para o Cloudinary:",
            uploadResult
          );
          throw new Error(
            uploadResult.error?.message || "Falha ao fazer upload da thumbnail."
          );
        }

        thumbnailData = {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        };
      } else if (
        updatedPost.thumbnail &&
        typeof updatedPost.thumbnail === "object"
      ) {
        // Mantém a thumbnail existente se não for alterada
        thumbnailData = {
          url: updatedPost.thumbnail.url,
          public_id: updatedPost.thumbnail.public_id,
        };
      }

      // Preparar os dados do post para atualização
      const postData: any = {
        title: updatedPost.title,
        content: updatedPost.content,
        meta: updatedPost.meta || "",
        tagsArray: updatedPost.tagsArray ?? post.tags,
        slug: updatedPost.slug || post.slug,
        categorySlug: updatedPost.categorySlug,
        categoryTitle: updatedPost.categoryTitle,
        categoryId: updatedPost.categoryId,
        authorId: currentUser.uid, // Passa o authorId para a ação server
      };

      if (thumbnailData) {
        postData.thumbnail = thumbnailData;
      } else {
        // Mantém a thumbnail existente se não for alterada
        postData.thumbnail = post.thumbnail;
      }

      // Atualiza o post no Firestore via uma requisição PUT para a API
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.message || "Falha ao atualizar o post.");
      }

      /* === AQUI: sincroniza o estado local com o que acabou de ser salvo === */
      setLocalPost((prev) => ({
        ...prev,
        ...updatedPost, // título, conteúdo, etc.
        thumbnail: postData.thumbnail, // objeto normalizado
        tags: postData.tagsArray ?? prev.tags,
        slug: postData.slug,
        categorySlug: postData.categorySlug,
        categoryTitle: postData.categoryTitle,
        categoryId: postData.categoryId,
      }));

      /* ---------- feedback para o usuário ---------- */

      // Sucesso: Informar o usuário e redirecionar imediatamente
      toast({
        title: "Sucesso!",
        description: "Post atualizado com sucesso!",
        variant: "default",
      });
      router.replace("/dashboard/posts"); // Redireciona imediatamente após a atualização
    } catch (error: any) {
      console.error("Erro ao atualizar o post:", error);
      setErrorMessage(error.message || "Ocorreu um erro ao atualizar o post.");
      toast({
        title: "Erro!",
        description: error.message || "Ocorreu um erro ao atualizar o post.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  // Garantir que post.thumbnail esteja conforme FinalPost
  const initialValue: FinalPost = {
    ...localPost,
    tags: localPost.tags.join(", "),
    thumbnail: localPost.thumbnail || undefined,
    categorySlug: localPost.categorySlug,
    categoryTitle: localPost.categoryTitle,
    categoryId: localPost.categoryId,
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <Editor
        initialValue={initialValue}
        onSubmit={handleSubmit}
        btnTitle="Atualizar"
        busy={busy}
      />
    </div>
  );
};

export default EditorWrapper;
