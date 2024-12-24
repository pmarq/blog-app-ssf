//action.ts
"use server";

import { v4 as uuidv4 } from "uuid";
import { Timestamp, DocumentReference } from "firebase-admin/firestore";
import { Post } from "@/app/models/Post";
import { postValidationSchema, validateSchema } from "@/lib/validationSchema";
import { firestore } from "@/firebase/server";

// Tipos das respostas
interface CreatePostResponse {
  postId?: string;
  error?: boolean;
  message?: string;
}

interface SavePostImagesParams {
  postId: string;
  paths: string[]; // URLs completas das imagens no Cloudinary
}

interface SavePostImagesResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}

/**
 * Cria um novo post no Firestore.
 * @param postData Dados do post.
 * @param authorId ID do autor do post.
 * @returns Resposta da operação.
 */
export async function createPost(
  postData: any,
  authorId: string
): Promise<CreatePostResponse> {
  try {
    // 1. Validação
    const errorMessage = validateSchema(postValidationSchema, postData);
    if (errorMessage) {
      return { error: true, message: errorMessage };
    }

    // 2. Checar slug duplicado
    const existing = await firestore
      .collection("posts")
      .where("slug", "==", postData.slug)
      .get();
    if (!existing.empty) {
      return { error: true, message: "Slug já está em uso. Por favor, escolha outro." };
    }

    // 3. Converter tags
    if (typeof postData.tags === "string") {
      postData.tags = postData.tags.split(",").map((t: string) => t.trim());
    }

    // 4. Gerar ID do post
    const postId = uuidv4();

    // 5. Montar objeto
    const newPost: Post = {
      id: postId,
      title: postData.title,
      slug: postData.slug,
      meta: postData.meta,
      content: postData.content,
      tags: postData.tags || [],
      thumbnail: null, // Será atualizado posteriormente
      author: firestore.collection("users").doc(authorId) as DocumentReference,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // 6. Salvar no Firestore
    await firestore.collection("posts").doc(postId).set(newPost);

    return { postId };
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return {
      error: true,
      message: (error as Error).message || "Falha ao criar o post",
    };
  }
}

/**
 * Salva as URLs das imagens no post criado.
 * @param data Parâmetros contendo o ID do post e as URLs das imagens.
 * @returns Resposta da operação.
 */
export async function savePostImages(data: SavePostImagesParams): Promise<SavePostImagesResponse> {
  try {
    const { postId, paths } = data;
    if (!paths || paths.length === 0) {
      return { success: true };
    }

    // 1) Define a primeira imagem como thumbnail, as demais como images
    const thumbnailPath = paths[0];
    const otherPaths = paths.slice(1);

    // 2) Montar objeto para update
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    // Monta "thumbnail" se existir
    if (thumbnailPath) {
      updateData.thumbnail = {
        url: thumbnailPath, // URL do Cloudinary
      };
    }

    // Monta "images" se tiver
    if (otherPaths.length > 0) {
      updateData.images = otherPaths.map((p) => ({
        path: p,
        url: p, // URL do Cloudinary
      }));
    }

    // 3) Atualizar o documento no Firestore
    const postRef = firestore.collection("posts").doc(postId);
    await postRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar imagens do post:", error);
    return {
      error: true,
      message: (error as Error).message || "Falha ao salvar imagens do post",
    };
  }
}
