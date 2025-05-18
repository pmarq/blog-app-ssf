//app/dashboard/categories/action.ts

"use server";

import { firestore } from "@/firebase/server";
import { revalidatePath } from "next/cache";

// Cria uma nova categoria (case-insensitive e sem duplicatas)
export async function createCategory(title: string) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return { success: false, error: "Título não pode estar vazio." };
  }

  const titleLower = normalizedTitle.toLowerCase();

  try {
    // 🔍 Verifica se já existe uma categoria com o mesmo título (case-insensitive)
    const existingSnapshot = await firestore
      .collection("categories")
      .where("title_lowercase", "==", titleLower)
      .get();

    if (!existingSnapshot.empty) {
      return {
        success: false,
        error: `A categoria "${normalizedTitle}" já existe.`,
      };
    }

    // ✅ Cria a nova categoria com campo auxiliar "title_lowercase"
    const docRef = await firestore.collection("categories").add({
      title: normalizedTitle,
      title_lowercase: titleLower,
    });

    revalidatePath("/dashboard/categories");

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro ao criar categoria." };
  }
}

// deletar categoria

export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🛑 Verifica se existe algum post usando essa categoria (opcional mas recomendado)
    const postsSnapshot = await firestore
      .collection("posts")
      .where(
        "category",
        "==",
        firestore.collection("categories").doc(categoryId)
      )
      .limit(1)
      .get();

    if (!postsSnapshot.empty) {
      return {
        success: false,
        error:
          "Não é possível excluir: categoria está associada a um ou mais posts.",
      };
    }

    // 🧹 Deleta a categoria
    await firestore.collection("categories").doc(categoryId).delete();

    // ♻️ Atualiza a página de categorias
    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir categoria:", error);
    return {
      success: false,
      error: error.message || "Erro ao excluir categoria.",
    };
  }
}

// Lista todas as categorias

export async function getAllCategories(): Promise<
  { id: string; title: string }[]
> {
  try {
    const snapshot = await firestore.collection("categories").get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { title: string }),
    }));
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}
