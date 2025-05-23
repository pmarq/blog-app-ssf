// app/api/posts/[categorySlug]/[slug]/route.ts

import { isThumbnail, Post } from "@/app/models/Post";
import { auth, firestore } from "@/firebase/server";
import { postValidationSchema, validateSchema } from "@/lib/validationSchema";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary.server"; // Importação direta da função server-side

// Tipos das respostas
interface UpdatePostResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}

// Tipos das respostas
interface DeletePostResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}

///-------///

export async function GET(
  request: NextRequest,
  context: { params: { slug: string; categorySlug: string } }
) {
  const { slug, categorySlug } = context.params;

  try {
    const postsRef = firestore.collection("posts");
    const querySnapshot = await postsRef
      .where("slug", "==", slug)
      .where("categorySlug", "==", categorySlug)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    const postDoc = querySnapshot.docs[0];
    const postData = postDoc.data();

    const thumbnail = postData.thumbnail?.url || null;
    const images = Array.isArray(postData.images)
      ? postData.images.map((img: any) => ({ path: img.path, url: img.url }))
      : [];

    console.log(
      "GET POST====>",
      postDoc.id,
      postData,
      thumbnail,
      categorySlug,
      images
    );

    return NextResponse.json({ thumbnail, images });
  } catch (error) {
    console.error("Erro ao buscar imagens do post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

////UPDATE///
/**
 * Handle PUT requests to update a post by slug
 */

export async function PUT(
  request: NextRequest,
  context: { params: { slug: string; categorySlug: string } }
) {
  const { slug, categorySlug: oldCategorySlug } = context.params;

  try {
    const body = await request.json();
    const {
      title,
      content,
      meta,
      tagsArray,
      slug: newSlug,
      thumbnail,
      authorId,
      categorySlug: newCategorySlug,
      categoryTitle,
      categoryId,
    } = body;

    const postData = {
      title,
      content,
      meta,
      tags: tagsArray,
      slug: newSlug || slug,
      thumbnail,
      categorySlug: newCategorySlug,
      categoryTitle,
      categoryId,
    };

    // Validação
    const errorMessage = validateSchema(postValidationSchema, postData);
    if (errorMessage) {
      return NextResponse.json(
        { error: true, message: errorMessage },
        { status: 400 }
      );
    }

    const postsRef = firestore.collection("posts");

    // 1. Busca pelo slug antigo (não depende da categoria para evitar conflitos)
    const postQuery = await postsRef.where("slug", "==", slug).get();

    if (postQuery.empty) {
      return NextResponse.json(
        { error: true, message: "Post não encontrado." },
        { status: 404 }
      );
    }

    const postDoc = postQuery.docs[0];
    const postId = postDoc.id;
    const existingPost = postDoc.data() as Post;

    // 2. Verifica se o autor é o mesmo
    const postAuthorRef =
      existingPost.author as FirebaseFirestore.DocumentReference;
    const postAuthorSnapshot = await postAuthorRef.get();
    const postAuthorId = postAuthorSnapshot.id;

    if (postAuthorId !== authorId) {
      return NextResponse.json(
        {
          error: true,
          message: "Você não tem permissão para atualizar este post.",
        },
        { status: 403 }
      );
    }

    // 3. Verifica se houve mudança de slug ou categoria
    if (
      newSlug !== existingPost.slug ||
      newCategorySlug !== existingPost.categorySlug
    ) {
      const duplicateCheck = await postsRef
        .where("slug", "==", newSlug)
        .where("categorySlug", "==", newCategorySlug)
        .get();

      if (!duplicateCheck.empty && duplicateCheck.docs[0].id !== postId) {
        return NextResponse.json(
          {
            error: true,
            message: "Já existe um post com esse slug nessa categoria.",
          },
          { status: 400 }
        );
      }
    }

    // 4. Tratamento das tags
    if (typeof postData.tags === "string") {
      postData.tags = postData.tags.split(",").map((t: string) => t.trim());
    }

    // 5. Upload novo? Substitui thumbnail antiga no Cloudinary
    if (postData.thumbnail && isThumbnail(postData.thumbnail)) {
      if (existingPost.thumbnail?.public_id) {
        await deleteFromCloudinary(existingPost.thumbnail.public_id);
      }
    } else if (
      typeof postData.thumbnail === "object" &&
      "url" in postData.thumbnail &&
      !("public_id" in postData.thumbnail)
    ) {
      postData.thumbnail = existingPost.thumbnail;
    }

    // 6. Dados finais a serem atualizados
    const updateData: Partial<Post> = {
      title: postData.title,
      slug: postData.slug,
      meta: postData.meta,
      content: postData.content,
      tags: postData.tags || [],
      categorySlug: postData.categorySlug,
      categoryTitle: postData.categoryTitle,
      category: postData.categoryId,
      updatedAt: Timestamp.now(),
    };

    if (postData.thumbnail && isThumbnail(postData.thumbnail)) {
      updateData.thumbnail = {
        url: postData.thumbnail.url,
        public_id: postData.thumbnail.public_id,
      };
    }

    // 7. Atualização final
    await postsRef.doc(postId).update(updateData);

    return NextResponse.json(
      { success: true, message: "Post atualizado com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar post:", error);
    return NextResponse.json(
      { error: true, message: error.message || "Falha ao atualizar o post." },
      { status: 500 }
    );
  }
}

/**
 * Handle DELETE requests to delete a post by slug
 */

export async function DELETE(
  request: NextRequest,
  context: { params: { slug: string; categorySlug: string } }
) {
  const { slug, categorySlug } = context.params;

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decodedToken.uid;
    console.log("Deletando post:", { slug, categorySlug, userId });

    const postsRef = firestore.collection("posts");
    const querySnapshot = await postsRef
      .where("slug", "==", slug)
      .where("categorySlug", "==", categorySlug)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postDoc = querySnapshot.docs[0];
    const postData = postDoc.data();

    if (postData.author.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (postData.thumbnail && postData.thumbnail.public_id) {
      try {
        await deleteFromCloudinary(postData.thumbnail.public_id);
      } catch (error) {
        console.error("Erro ao deletar thumbnail do Cloudinary:", error);
        return NextResponse.json(
          { error: "Failed to delete thumbnail from Cloudinary" },
          { status: 500 }
        );
      }
    }

    await postDoc.ref.delete();

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
