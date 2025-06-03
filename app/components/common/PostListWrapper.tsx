// app/components/common/PostsListWrapper.tsx

"use client";

import React, { useState } from "react";
import PostsList from "./PostList";
import { PostDetail } from "@/app/utils/types";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast"; // Import do hook de toast
import ConfirmDeleteModal from "./ConfirmDeleteModal";
// Importe o componente de modal de confirmação

interface PostsListWrapperProps {
  initialPosts: PostDetail[];
  initialLastVisibleId?: string;
  hasMore: boolean;
  showControls?: boolean;
}

// Função para construir URLs absolutas
const buildUrl = (path: string) => {
  // Determina o domínio base (navegador ou servidor)
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin // No navegador
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // No servidor

  try {
    // Cria a URL absoluta combinando o domínio base e o caminho
    return new URL(path, baseUrl).toString();
  } catch (error) {
    console.error("Erro ao construir a URL:", { path, baseUrl, error });
    throw new Error("Failed to build URL");
  }
};

const PostsListWrapper: React.FC<PostsListWrapperProps> = ({
  initialPosts,
  initialLastVisibleId,
  hasMore,
  showControls = false, // Valor padrão para a prop
}) => {
  // Estado para armazenar os posts
  const [posts, setPosts] = useState<PostDetail[]>(initialPosts);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(hasMore);
  const [lastVisibleId, setLastVisibleId] = useState<string | undefined>(
    initialLastVisibleId
  );

  // Estados para gerenciar a deleção
  const [modalOpen, setModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostDetail | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const { toast } = useToast(); // Obtém a função toast do hook useToast

  console.log("Posts iniciais:", initialPosts); // Loga os posts iniciais
  console.log("ID visível inicial:", initialLastVisibleId); // Loga o ID inicial

  // Função para carregar mais posts
  const loadMorePosts = async () => {
    if (!hasMorePosts || !lastVisibleId) return;

    try {
      // Constrói a URL absoluta para buscar mais posts
      const url = buildUrl(
        `/api/posts?limit=16&lastVisibleId=${lastVisibleId}`
      );
      console.log("Buscando posts na URL:", url);

      // Faz a requisição para a API
      const response = await fetch(url);
      console.log("Resposta recebida:", response);

      // Verifica se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro ao buscar posts: ${response.statusText}`);
      }

      // Converte a resposta para JSON
      const data = await response.json();
      console.log("Dados recebidos:", data);

      // Atualiza o estado com os novos posts
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMorePosts(data.hasMore);
      setLastVisibleId(data.lastVisibleId);
    } catch (error: unknown) {
      let errorMessage = "Não foi possível carregar mais posts.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Erro ao carregar posts:", error);
      setHasMorePosts(false);
      toast({
        title: "Erro ao Carregar Posts",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Função para abrir o modal de confirmação de deleção
  const openDeleteModal = (post: PostDetail) => {
    setPostToDelete(post);
    setModalOpen(true);
  };

  // Função para fechar o modal de confirmação de deleção
  const closeDeleteModal = () => {
    setPostToDelete(null);
    setModalOpen(false);
  };

  // Função para confirmar a deleção do post
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setDeleteBusy(true);

    try {
      // Obter o token de autenticação
      const token = await currentUser?.getIdToken();
      if (!token) {
        toast({
          title: "Usuário Não Autenticado",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`/api/posts/${postToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao deletar o post.");
      }

      const result = await res.json();
      toast({
        title: "Post Deletado",
        description: result.message || "Post deletado com sucesso.",
        variant: "default",
      });
      // Remover o post da lista local
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    } catch (error: unknown) {
      console.error("Erro ao deletar o post:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Falha ao deletar o post.";

      toast({
        title: "Erro ao Deletar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteBusy(false);
      closeDeleteModal();
    }
  };

  return (
    <>
      <PostsList
        posts={posts}
        loadMorePosts={loadMorePosts}
        hasMorePosts={hasMorePosts}
        onDeleteClick={openDeleteModal} // Passa a função de deleção para o PostsList
        showControls={showControls} // Passa a prop para controlar a exibição dos botões
      />

      {/* Modal de Confirmação de Deleção */}
      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        postTitle={postToDelete ? postToDelete.title : ""}
        busy={deleteBusy}
      />
    </>
  );
};

export default PostsListWrapper;
