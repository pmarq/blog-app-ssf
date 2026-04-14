// app/dashboard/banners/action.ts

"use server";

import { Timestamp } from "firebase-admin/firestore";

import { firestore } from "@/firebase/server"; // Importação correta do Firestore
import { v2 as cloudinary } from "cloudinary";
import {
  FeaturedBannerServerSchema,
  FeaturedBannerServer,
} from "@/lib/featuredBannerServer";
import { Banner } from "@/app/models/Banners";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tipos das respostas
interface CreateBannerResponse {
  bannerId?: string;
  error?: boolean;
  message?: string;
}

interface UpdateBannerResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}

interface DeleteBannerResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}

/**
 * Cria um novo banner no Firestore.
 * @param bannerData Dados do banner, incluindo imageUrl e publicId.
 * @returns Resposta da operação.
 */
export async function createFeaturedBanner(
  bannerData: FeaturedBannerServer
): Promise<CreateBannerResponse> {
  try {
    console.log("Recebendo dados do banner:", bannerData);

    // 1. Validação usando o esquema do servidor
    const validation = FeaturedBannerServerSchema.safeParse(bannerData);
    if (!validation.success) {
      return {
        error: true,
        message: validation.error.errors.map((err) => err.message).join(", "),
      };
    }

    // 2. Gerar ID do banner
    const bannerId = crypto.randomUUID();

    // 3. Montar objeto
    const newBanner: Banner = {
      id: bannerId,
      title: bannerData.title,
      link: bannerData.link,
      linkTitle: bannerData.linkTitle,
      banner: {
        url: bannerData.imageUrl,
        public_id: bannerData.publicId,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("Banner criado:", newBanner);

    // 4. Salvar no Firestore
    await firestore.collection("featuredBanners").doc(bannerId).set(newBanner);

    console.log("Banner criado com sucesso:", bannerId);

    return { bannerId };
  } catch (error) {
    console.error("Erro ao criar banner:", error);
    return {
      error: true,
      message: (error as Error).message || "Falha ao criar o banner",
    };
  }
}

/**
 * Obtém todos os banners em destaque do Firestore.
 * @returns Lista de banners.
 */
export async function getFeaturedBanners(): Promise<Banner[]> {
  const snapshot = await firestore.collection("featuredBanners").get();
  const banners: Banner[] = [];
  snapshot.forEach((doc) => {
    banners.push(doc.data() as Banner);
  });
  return banners;
}

/**
 * Obtém um banner específico pelo ID.
 * @param bannerId ID do banner.
 * @returns Banner ou null se não encontrado.
 */
export async function getFeaturedBannerById(
  bannerId: string
): Promise<Banner | null> {
  const doc = await firestore.collection("featuredBanners").doc(bannerId).get();
  if (!doc.exists) return null;
  return doc.data() as Banner;
}

/**
 * Atualiza um banner existente no Firestore.
 * @param bannerId ID do banner a ser atualizado.
 * @param bannerData Dados atualizados do banner, incluindo possivelmente uma nova imagem.
 * @returns Resposta da operação.
 */
export async function updateFeaturedBanner(
  bannerId: string,
  bannerData: FeaturedBannerServer
): Promise<UpdateBannerResponse> {
  try {
    console.log("Recebendo dados para atualizar o banner:", bannerData);

    // 1. Validação usando o esquema do servidor
    const validation = FeaturedBannerServerSchema.safeParse(bannerData);
    if (!validation.success) {
      return {
        error: true,
        message: validation.error.errors.map((err) => err.message).join(", "),
      };
    }

    // 2. Buscar o banner pelo ID
    const bannerRef = firestore.collection("featuredBanners").doc(bannerId);
    const bannerDoc = await bannerRef.get();

    if (!bannerDoc.exists) {
      return { error: true, message: "Banner não encontrado." };
    }

    const existingBanner = bannerDoc.data() as Banner;

    // 3. Gerenciar imagem
    const updateData: Partial<Banner> = {
      title: bannerData.title,
      link: bannerData.link,
      linkTitle: bannerData.linkTitle,
      updatedAt: Timestamp.now(),
    };

    if (bannerData.imageUrl && bannerData.publicId) {
      // 3.1 Deletar a imagem antiga do Cloudinary, se existir
      if (existingBanner.banner && existingBanner.banner.public_id) {
        try {
          await cloudinary.uploader.destroy(existingBanner.banner.public_id);
          console.log(
            "Imagem antiga deletada do Cloudinary:",
            existingBanner.banner.public_id
          );
        } catch (err) {
          console.error("Erro ao deletar imagem antiga:", err);
          throw new Error("Falha ao deletar imagem antiga.");
        }
      }

      // 3.2 Adicionar a nova imagem
      updateData.banner = {
        url: bannerData.imageUrl,
        public_id: bannerData.publicId,
      };
    }

    // 4. Atualizar no Firestore
    await bannerRef.update(updateData);

    console.log("Banner atualizado com sucesso:", bannerId);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    return {
      error: true,
      message: (error as Error).message || "Falha ao atualizar o banner",
    };
  }
}

/**
 * Deleta um banner existente no Firestore e remove a imagem do Cloudinary, se aplicável.
 * @param bannerId ID do banner a ser deletado.
 * @returns Resposta da operação.
 */
export async function deleteFeaturedBanner(
  bannerId: string
): Promise<DeleteBannerResponse> {
  try {
    console.log("Iniciando deleção do banner com ID:", bannerId);

    // 1. Buscar o banner pelo ID
    const bannerRef = firestore.collection("featuredBanners").doc(bannerId);
    const bannerDoc = await bannerRef.get();

    if (!bannerDoc.exists) {
      return { error: true, message: "Banner não encontrado." };
    }

    const existingBanner = bannerDoc.data() as Banner;

    // 2. Remover a imagem do Cloudinary, se existir
    if (existingBanner.banner && existingBanner.banner.public_id) {
      try {
        await cloudinary.uploader.destroy(existingBanner.banner.public_id);
        console.log(
          "Imagem do banner deletada do Cloudinary:",
          existingBanner.banner.public_id
        );
      } catch (err) {
        console.error("Erro ao deletar imagem do Cloudinary:", err);
        return { error: true, message: "Falha ao deletar imagem do banner." };
      }
    }

    // 3. Deletar o documento do Firestore
    await bannerRef.delete();
    console.log("Banner deletado com sucesso:", bannerId);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar banner:", error);
    return {
      error: true,
      message: (error as Error).message || "Falha ao deletar o banner.",
    };
  }
}
