// lib/cloudinaryUpload.ts

export interface UploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Faz upload de um arquivo para o Cloudinary utilizando uploads assinados.
 * @param file - O arquivo a ser enviado.
 * @param folder - A pasta no Cloudinary onde a imagem será armazenada.
 * @returns A resposta completa do upload, incluindo secure_url e public_id.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<UploadResponse> {
  try {
    // Solicita a assinatura e timestamp do servidor, passando os parâmetros necessários
    const signatureResponse = await fetch(
      `/api/cloudinary/get-signature?folder=${encodeURIComponent(folder)}`
    );

    if (!signatureResponse.ok) {
      const errorData = await signatureResponse.json();
      console.error("Erro ao obter assinatura:", errorData);
      throw new Error("Falha ao obter assinatura para upload.");
    }

    const { timestamp, signature } = await signatureResponse.json();

    // Monta o FormData com o arquivo e informações necessárias para uploads assinados
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    // Faz a requisição para o endpoint do Cloudinary com uploads assinados
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Erro na resposta do Cloudinary:", data);
      throw new Error(data.error?.message || "Erro ao fazer upload para o Cloudinary.");
    }

    if (!data.secure_url || !data.public_id) {
      throw new Error("Erro ao fazer upload para o Cloudinary.");
    }

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      ...data,
    };
  } catch (error) {
    console.error("Erro ao fazer upload para o Cloudinary:", error);
    throw error;
  }
}


