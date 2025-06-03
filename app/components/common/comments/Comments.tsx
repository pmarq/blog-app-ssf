// components/Comments.tsx

"use client";

import { FC, useCallback, useEffect, useState } from "react";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import { useAuth } from "@/context/auth";
import { CommentResponse } from "@/app/utils/types";

interface Props {
  belongsTo: string; // ID ou slug do post
}

const Comments: FC<Props> = ({ belongsTo }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Função auxiliar para obter token de autenticação do Firebase
  const getBearerToken = async (): Promise<string> => {
    if (!currentUser) return "";
    try {
      const token = await currentUser.getIdToken(false);
      return `Bearer ${token}`;
    } catch (error) {
      console.error("Erro ao obter token do usuário:", error);
      return "";
    }
  };

  // 1) Buscar comentários (GET /api/comments?postId=...)
  const fetchComments = useCallback(
    async (postId: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/comments?postId=${encodeURIComponent(postId)}`
        );
        if (!res.ok) {
          console.error("Erro na resposta da API:", await res.text());
          return;
        }
        const data = await res.json();
        const userId = currentUser?.uid;

        const updatedComments: CommentResponse[] = data.comments.map(
          (comment: any) => ({
            ...comment,
            likedByOwner: userId ? comment.likedBy?.includes(userId) : false,
            replies: comment.replies.map((reply: any) => ({
              ...reply,
              likedByOwner: userId ? reply.likedBy?.includes(userId) : false,
            })),
          })
        );

        setComments(updatedComments);
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!belongsTo) return;
    fetchComments(belongsTo);
  }, [belongsTo, currentUser, fetchComments]);

  // 2) Criar novo comentário (chiefComment)
  const handleNewCommentSubmit = async (content: string) => {
    if (!currentUser) return;

    try {
      const bearer = await getBearerToken();
      // Monta objeto 'owner'
      const owner = {
        name: currentUser.displayName || "Usuário sem nome",
        id: currentUser.uid,
        avatar: currentUser.photoURL || "",
      };

      // Faz a requisição POST
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearer,
        },
        body: JSON.stringify({
          content,
          postId: belongsTo,
          owner,
          chiefComment: true,
        }),
      });

      if (!response.ok) {
        console.error("Falha ao criar comentário:", await response.text());
        return;
      }

      // Se deu certo, pegamos o JSON que contém { commentId, ...newComment }
      const data = await response.json();

      // Inserir manualmente no estado local
      if (data.commentId) {
        const newComment: CommentResponse = {
          id: data.commentId,
          content: data.content,
          createdAt: data.createdAt,
          likes: data.likes || 0,
          likedByOwner: false,
          chiefComment: data.chiefComment,
          repliedTo: data.repliedTo,
          owner: data.owner,
          replies: [],
        };

        // Atualiza a lista local para exibir imediatamente
        setComments((prev) => [newComment, ...prev]);
      }

      // (Opcional) Atualizar do servidor para garantir sincronização
      // fetchComments(belongsTo);
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
    }
  };

  // 3) Responder a um comentário principal
  const handleReplySubmit = async (content: string, chiefId: string) => {
    if (!currentUser) return;
    try {
      const bearer = await getBearerToken();
      const owner = {
        name: currentUser.displayName || "Usuário sem nome",
        id: currentUser.uid,
        avatar: currentUser.photoURL || "",
      };

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearer,
        },
        body: JSON.stringify({
          content,
          postId: belongsTo,
          owner,
          chiefComment: false,
          repliedTo: chiefId,
        }),
      });

      if (!response.ok) {
        console.error("Falha ao criar reply:", await response.text());
        return;
      }

      const data = await response.json();

      // Inserir manualmente a reply no estado local
      if (data.commentId) {
        const newReply: CommentResponse = {
          id: data.commentId,
          content: data.content,
          createdAt: data.createdAt,
          likes: data.likes || 0,
          likedByOwner: false,
          chiefComment: false,
          repliedTo: chiefId,
          owner: data.owner,
          replies: [],
        };

        // Atualiza local sem precisar recarregar tudo
        setComments((prev) => {
          // Encontra o comentário principal
          return prev.map((c) => {
            if (c.id === chiefId) {
              const newReplies = c.replies
                ? [...c.replies, newReply]
                : [newReply];
              return { ...c, replies: newReplies };
            }
            return c;
          });
        });
      }

      // fetchComments(belongsTo); // se quiser garantir
    } catch (error) {
      console.error("Erro ao criar reply:", error);
    }
  };

  // 4) Editar (PATCH) o comentário
  const handleUpdateSubmit = async (content: string, commentId: string) => {
    try {
      const bearer = await getBearerToken();
      const res = await fetch(`/api/comments?commentId=${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearer,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        console.error("Falha ao editar comentário:", await res.text());
        return;
      }
      const data = await res.json();

      // Atualiza local sem refetch
      setComments((prev) => {
        // Observa se é chiefComment ou reply
        return prev.map((c) => {
          // Se o comentário atual é o editado:
          if (c.id === commentId) {
            return { ...c, content: data.content };
          }
          // Se não for, pode estar nas replies
          if (c.replies?.length) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === commentId) {
                return { ...r, content: data.content };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        });
      });

      // fetchComments(belongsTo); // se quiser garantir
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
    }
  };

  // 5) Deletar comentário (e replies, se chiefComment)
  const handleOnDeleteClick = async (comment: CommentResponse) => {
    try {
      const bearer = await getBearerToken();
      const res = await fetch(`/api/comments?commentId=${comment.id}`, {
        method: "DELETE",
        headers: {
          Authorization: bearer,
        },
      });

      if (!res.ok) {
        console.error("Falha ao deletar comentário:", await res.text());
        return;
      }

      // Agora removemos do estado local
      setComments((prev) => {
        // Se chiefComment, removemos também as replies
        if (comment.chiefComment) {
          return prev.filter((c) => c.id !== comment.id);
        }
        // Se reply, removemos só do array de replies
        return prev.map((c) => {
          if (c.replies?.length && c.id === comment.repliedTo) {
            const filteredReplies = c.replies.filter(
              (r) => r.id !== comment.id
            );
            return { ...c, replies: filteredReplies };
          }
          return c;
        });
      });

      // fetchComments(belongsTo); // se quiser garantir
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };

  // 6) Implementar "Like"
  const handleOnLikeClick = async (comment: CommentResponse) => {
    if (!currentUser) {
      alert("Por favor, faça login para curtir comentários.");
      return;
    }

    try {
      const bearer = await getBearerToken();
      const action = comment.likedByOwner ? "unlike" : "like";

      const res = await fetch(`/api/comments?commentId=${comment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearer,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Falha ao processar like/unlike:", errorData.error);
        alert(errorData.error || "Erro ao processar a ação.");
        return;
      }

      const data = await res.json();

      // Atualiza localmente o estado de 'likes' e 'likedByOwner'
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === comment.id) {
            const updatedLikes = c.likes + (data.action === "liked" ? 1 : -1);
            const updatedLikedByOwner = data.action === "liked" ? true : false;
            return {
              ...c,
              likes: updatedLikes,
              likedByOwner: updatedLikedByOwner,
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Erro ao processar like/unlike:", error);
      alert("Erro ao processar a ação de like.");
    }
  };

  if (loading) return <p>Carregando comentários...</p>;

  return (
    <div className="py-20 space-y-4">
      {/* Se user logado, mostra form. Senão, "Log in to add comment" */}
      {currentUser ? (
        <CommentForm onSubmit={handleNewCommentSubmit} title="Add comment" />
      ) : (
        <div className="flex flex-col items-end space-y-2">
          <h3 className="text-secondary-dark text-xl font-semibold">
            Log in to add comment
          </h3>
        </div>
      )}

      {/* Listar comentários principais */}
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentCard
            comment={comment}
            showControls={currentUser?.uid === comment.owner.id}
            onReplySubmit={(content) => handleReplySubmit(content, comment.id)}
            onUpdateSubmit={(content) =>
              handleUpdateSubmit(content, comment.id)
            }
            onDeleteClick={() => handleOnDeleteClick(comment)}
            onLikeClick={() => handleOnLikeClick(comment)}
          />

          {/* Listar replies */}
          {comment.replies?.length ? (
            <div className="w-[93%] ml-auto space-y-3">
              <h1 className="text-secondary-dark mb-3">Replies</h1>
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  showControls={currentUser?.uid === reply.owner.id}
                  onReplySubmit={(content) =>
                    handleReplySubmit(content, reply.id)
                  }
                  onUpdateSubmit={(content) =>
                    handleUpdateSubmit(content, reply.id)
                  }
                  onDeleteClick={() => handleOnDeleteClick(reply)}
                  onLikeClick={() => handleOnLikeClick(reply)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Comments;
