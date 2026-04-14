// app/lib/fetchComments.ts

import { LatestComment, CommentResponse } from "@/app/utils/types";
import { firestore } from "@/firebase/server";
import { mapCommentDocument } from "./mappers";

export async function fetchLatestComments(limit: number): Promise<{
  comments: LatestComment[];
}> {
  try {
    // Buscar os comentários principais (chiefComments) mais recentes
    const chiefSnap = await firestore
      .collection("comments")
      .where("chiefComment", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const comments: LatestComment[] = [];

    for (const docSnap of chiefSnap.docs) {
      const data = docSnap.data();
      const docId = docSnap.id;
      const postId = data.postId || "";

      // Buscar os dados do post ao qual o comentário pertence
      const postDoc = await firestore.collection("posts").doc(postId).get();
      const postData = postDoc.exists ? postDoc.data() : null;

      if (!postData) {
        console.warn(`Post com ID ${postId} não encontrado para o comentário ${docId}.`);
        continue; // Pula este comentário se o post não for encontrado
      }

      // Mapear o comentário principal
      const mappedComment: LatestComment = {
        id: docId,
        postId: data.postId,
        content: data.content || "",
        owner: {
          id: data.owner?.id || "",
          name: data.owner?.name || "Unknown",
          avatar: data.owner?.avatar || "",
        },
        belongsTo: {
          id: postDoc.id,
          title: postData.title || "Untitled",
          slug: postData.slug || "",
          categorySlug: postData.categorySlug || "",
        },
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
        likes: data.likes || 0,
        likedBy: data.likedBy || [],
        replies: [], // Será preenchido a seguir
      };

      // Buscar replies associados a este comentário
      const repliesSnap = await firestore
        .collection("comments")
        .where("repliedTo", "==", docId)
        .orderBy("createdAt", "asc")
        .get();

      // Mapear as replies
      const replies: CommentResponse[] = repliesSnap.docs.map((rDoc) =>
        mapCommentDocument(rDoc.data(), rDoc.id)
      );

      // Atribuir as replies ao comentário principal
      mappedComment.replies = replies;

      comments.push(mappedComment);
    }

    return { comments };
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return { comments: [] };
  }
}
