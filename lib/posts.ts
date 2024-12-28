// app/lib/posts.ts
import { Post, PostResponse } from "@/app/models/Post";
import { formatPost } from "@/app/models/Utils";
import { PostDetail } from "@/app/utils/types";
import { firestore } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";

export const getPostBySlug = async (
  slug: string
): Promise<PostDetail | null> => { // Alterado para PostDetail
  try {
    console.log(`Buscando post com slug: ${slug}`);
    const snapshot = await firestore
      .collection("posts")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("Post não encontrado no banco de dados.");
      return null;
    }

    const doc = snapshot.docs[0];
    const postData = doc.data() as Post;

    const { title, content, thumbnail, tags, meta, createdAt } = postData; // Incluído createdAt

    const result: PostDetail = { // Alterado para PostDetail
      id: doc.id,
      title,
      content,
      tags: Array.isArray(tags) ? tags : [], // Mantenha tags como array
      thumbnail: thumbnail || null,
      slug,
      meta,
      createdAt: (createdAt as Timestamp).toDate().toISOString(), // Convertendo Timestamp para string ISO
    };

    console.log("Post encontrado:", result);
    return result;
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
};

////////////
/**
 * Formata os dados do post conforme necessário. */

/**
 * Busca os posts iniciais com limite.
 */
export const fetchInitialPosts = async (
  limit: number
): Promise<{ posts: PostDetail[]; lastVisibleId: string | undefined }> => {
  try {
    const snapshot = await firestore
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return { posts: [], lastVisibleId: undefined };
    }

    const posts: PostDetail[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Post;
      posts.push(formatPost({ ...data, id: doc.id }));
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const lastVisibleId = lastVisible.id;

    return { posts, lastVisibleId };
  } catch (error) {
    console.error("Error fetching initial posts:", error);
    return { posts: [], lastVisibleId: undefined };
  }
};
/**
 * Busca mais posts a partir de um cursor.
 */
export const fetchMorePosts = async (
  limit: number,
  lastVisibleId: string
): Promise<{ posts: PostDetail[]; lastVisibleId: string | undefined }> => {
  try {
    const lastDoc = await firestore
      .collection("posts")
      .doc(lastVisibleId)
      .get();

    if (!lastDoc.exists) {
      console.warn("Documento lastVisibleId não encontrado.");
      return { posts: [], lastVisibleId: undefined };
    }

    const snapshot = await firestore
      .collection("posts")
      .orderBy("createdAt", "desc")
      .startAfter(lastDoc)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return { posts: [], lastVisibleId: undefined };
    }

    const posts: PostDetail[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Post;
      posts.push(formatPost({ ...data, id: doc.id }));
    });

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
    const newLastVisibleId = newLastVisible.id;

    return { posts, lastVisibleId: newLastVisibleId };
  } catch (error) {
    console.error("Error fetching more posts:", error);
    return { posts: [], lastVisibleId: undefined };
  }
};

/**
 * Busca todos os slugs dos posts no Firestore.
 */
export const getAllPostSlugs = async (): Promise<string[]> => {
  try {
    const snapshot = await firestore.collection('posts').get();
    const slugs: string[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        slugs.push(data.slug);
      }
    });
    return slugs;
  } catch (error) {
    console.error('Erro ao buscar slugs dos posts:', error);
    return [];
  }
};
