//app/dashboard/categories/action.ts

"use server";

import { firestore } from "@/firebase/server";
import { revalidatePath } from "next/cache";

function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-"); // Espaços viram hífen
}

// Cria uma nova categoria (case-insensitive e sem duplicatas)
export async function createCategory(title: string) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    return { success: false, error: "Título não pode estar vazio." };
  }

  const titleLower = normalizedTitle.toLowerCase();
  const slug = generateSlug(normalizedTitle);

  try {
    const existingSnapshot = await firestore
      .collection("categories")
      .where("title_lowercase", "==", titleLower)
      .get();

    if (!existingSnapshot.empty) {
      return {
        success: false,
        error: `A categoria \"${normalizedTitle}\" já existe.`,
      };
    }

    const docRef = await firestore.collection("categories").add({
      title: normalizedTitle,
      title_lowercase: titleLower,
      slug,
    });

    revalidatePath("/dashboard/categories");

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro ao criar categoria." };
  }
}

// Deleta uma categoria (se não estiver sendo usada em posts)
export async function deleteCategory(categoryId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const postsSnapshot = await firestore
      .collection("posts")
      .where("category", "==", firestore.doc(`categories/${categoryId}`))
      .limit(1)
      .get();

    if (!postsSnapshot.empty) {
      return {
        success: false,
        error: "Não é possível excluir: categoria associada a posts.",
      };
    }

    await firestore.collection("categories").doc(categoryId).delete();
    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao excluir categoria.";
    console.error("Erro ao excluir categoria:", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Lista todas as categorias
export async function getAllCategories(): Promise<
  { id: string; title: string; slug: string }[]
> {
  try {
    const snapshot = await firestore.collection("categories").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}
