// app/lib/fetchPosts.ts

import { PostDetail } from "@/app/utils/types";
import { firestore } from "@/firebase/server";

export async function fetchInitialPosts(limit: number): Promise<{
  posts: PostDetail[];
  lastVisibleId?: string;
  hasMore: boolean;
}> {
  try {
    const snapshot = await firestore
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const posts: PostDetail[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        slug: data.slug,
        meta: data.meta,
        tags: data.tags,
        thumbnail: data.thumbnail || "",
        createdAt: data.createdAt.toDate().toISOString(),
        categorySlug: data.categorySlug || "",
        categoryTitle: data.categoryTitle || "",
        categoryId: data.category?.id || "",
      });
    });

    const hasMore = snapshot.size === limit;
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const lastVisibleId = lastVisible ? lastVisible.id : undefined;

    return { posts, lastVisibleId, hasMore };
  } catch (error) {
    console.error("Erro ao buscar posts iniciais:", error);
    return { posts: [], lastVisibleId: undefined, hasMore: false };
  }
}

export async function fetchMorePosts(
  limit: number,
  lastVisibleId: string
): Promise<{
  posts: PostDetail[];
  lastVisibleId?: string;
  hasMore: boolean;
}> {
  try {
    const lastDoc = await firestore
      .collection("posts")
      .doc(lastVisibleId)
      .get();

    if (!lastDoc.exists) {
      throw new Error("lastVisibleId inválido.");
    }

    const snapshot = await firestore
      .collection("posts")
      .orderBy("createdAt", "desc")
      .startAfter(lastDoc)
      .limit(limit)
      .get();

    const posts: PostDetail[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        slug: data.slug,
        meta: data.meta,
        tags: data.tags,
        thumbnail: data.thumbnail || "",
        createdAt: data.createdAt.toDate().toISOString(),
        categorySlug: data.categorySlug || "",
        categoryTitle: data.categoryTitle || "",
        categoryId: data.category?.id || "",
      });
    });

    const hasMore = snapshot.size === limit;
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const newLastVisibleId = lastVisible ? lastVisible.id : undefined;

    return { posts, lastVisibleId: newLastVisibleId, hasMore };
  } catch (error) {
    console.error("Erro ao buscar mais posts:", error);
    return { posts: [], lastVisibleId: undefined, hasMore: false };
  }
}
