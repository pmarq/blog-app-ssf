// lib/cloudinary.server.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Deleta uma imagem do Cloudinary pelo public_id.
 * Esta função deve ser utilizada apenas no server-side.
 * @param publicId O public_id da imagem no Cloudinary.
 * @returns void
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Falha ao deletar imagem: ${result.result}`);
    }
    console.log(`Imagem com public_id ${publicId} deletada com sucesso.`);
  } catch (error) {
    console.error("Erro ao deletar imagem do Cloudinary:", error);
    throw error;
  }
};
