// app/dashboard/banners/action.ts

"use server";

import { v4 as uuidv4 } from "uuid";
import { Timestamp, DocumentReference } from "firebase-admin/firestore";

import { firestore } from "@/firebase/server"; // Importação correta do Firestore
import { uploadToCloudinary } from "@/lib/cloudinaryUpload"; // Função de upload existente
import { v2 as cloudinary } from "cloudinary";
import { newFeaturedBannerValidationSchema, oldFeaturedBannerValidationSchema } from "@/lib/featuredBanner";
import { validateSchema } from "@/lib/validationSchema";
import { Banner } from "@/app/models/Banners";

// Tipos das respostas
interface CreateBannerResponse {
  bannerId?: string;
  error?: boolean;
  message?: string;
}

/**
 * Cria um novo banner no Firestore.
 * @param bannerData Dados do banner.
 * @returns Resposta da operação.
 */
export async function createFeaturedBanner(
  bannerData: any
): Promise<CreateBannerResponse> {
  try {
    console.log("Recebendo dados do banner:", bannerData);

    // 1. Validação
    const errorMessage = validateSchema(newFeaturedBannerValidationSchema, bannerData);
    if (errorMessage) {
      return { error: true, message: errorMessage };
    }

    // 2. Checar se já existe um banner com o mesmo título ou link, se necessário
    // Opcional: Implementar se há necessidade de campos únicos

    // 3. Gerar ID do banner
    const bannerId = uuidv4();

    // 4. Fazer upload da imagem para o Cloudinary e obter URL e public_id
    let bannerUrl = "";
    let bannerPublicId = "";

    if (bannerData.file instanceof File) {
      // Upload da imagem enviada como File
      const uploadResponse = await uploadToCloudinary(bannerData.file, `banners/${bannerId}`);
      bannerUrl = uploadResponse.secure_url;
      bannerPublicId = uploadResponse.public_id;
      console.log("Banner URL após upload:", bannerUrl);
    } else if (
      bannerData.file &&
      typeof bannerData.file === "object" &&
      "url" in bannerData.file &&
      "public_id" in bannerData.file
    ) {
      // Banner já enviado como objeto com url e public_id
      bannerUrl = bannerData.file.url;
      bannerPublicId = bannerData.file.public_id;
      console.log("Banner recebido como objeto:", bannerUrl, bannerPublicId);
    }

    // 5. Montar objeto
    const newBanner: Banner = {
      id: bannerId,
      title: bannerData.title,
      link: bannerData.link,
      linkTitle: bannerData.linkTitle,
      banner: {
        url: bannerUrl,
        public_id: bannerPublicId,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("Banner criado:", newBanner);

    // 6. Salvar no Firestore
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


// TUPDATE BANNER 

interface UpdateBannerResponse {
    success?: boolean;
    error?: boolean;
    message?: string;
  }
  
  /**
   * Atualiza um banner existente no Firestore.
   * @param bannerId ID do banner a ser atualizado.
   * @param bannerData Dados atualizados do banner, incluindo possivelmente uma nova imagem.
   * @returns Resposta da operação.
   */
  export async function updateFeaturedBanner(
    bannerId: string,
    bannerData: any
  ): Promise<UpdateBannerResponse> {
    try {
      console.log("Recebendo dados para atualizar o banner:", bannerData);
  
      // 1. Validação
      const errorMessage = validateSchema(oldFeaturedBannerValidationSchema, bannerData);
      if (errorMessage) {
        return { error: true, message: errorMessage };
      }
  
      // 2. Buscar o banner pelo ID
      const bannerRef = firestore.collection("featuredBanners").doc(bannerId);
      const bannerDoc = await bannerRef.get();
  
      if (!bannerDoc.exists) {
        return { error: true, message: "Banner não encontrado." };
      }
  
      const existingBanner = bannerDoc.data() as Banner;
  
      // 3. Gerenciar imagem
      let updateData: Partial<Banner> = {
        title: bannerData.title,
        link: bannerData.link,
        linkTitle: bannerData.linkTitle,
        updatedAt: Timestamp.now(),
      };
  
      if (bannerData.file) {
        // 3.1 Deletar a imagem antiga do Cloudinary, se existir
        if (existingBanner.banner && existingBanner.banner.public_id) {
          try {
            await cloudinary.uploader.destroy(existingBanner.banner.public_id);
          } catch (err) {
            console.error("Erro ao deletar imagem antiga:", err);
            throw new Error("Falha ao deletar imagem antiga.");
          }
        }
  
        // 3.2 Fazer upload da nova imagem
        const uploadResponse = await uploadToCloudinary(bannerData.file, `banners/${bannerId}`);
        updateData.banner = {
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
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