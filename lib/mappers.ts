// app/lib/mappers.ts

import {CommentResponse} from "@/app/utils/types";

/**
 * Mapeia um documento de comentário do Firestore para a interface CommentResponse.
 * @param docData Dados do documento do Firestore.
 * @param docId ID do documento do Firestore.
 * @returns Objeto mapeado conforme a interface CommentResponse.
 */
export function mapCommentDocument(docData: any, docId: string): CommentResponse {
  return {
    id: docId,
    content: docData.content || "",
    createdAt: docData.createdAt ? docData.createdAt.toDate().toISOString() : "",
    likes: docData.likes || 0,
    chiefComment: !!docData.chiefComment,
    repliedTo: docData.repliedTo || null,
    owner: {
      id: docData.owner?.id || "",
      name: docData.owner?.name || "Unknown",
      avatar: docData.owner?.avatar || "",
    },
    likedBy: docData.likedBy || [],
  };
}
