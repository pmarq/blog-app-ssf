// lib/validationSchema.ts

import { z } from "zod";

// Definição do esquema comum para banners
export const commonValidationFeaturedBanner = z.object({
  title: z.string().nonempty("Título é obrigatório"),
  link: z
    .string()
    .nonempty("Link é obrigatório")
    .url("Link deve ser uma URL válida"),
  linkTitle: z.string().nonempty("Título do link é obrigatório"),
});

// Esquema para criação de banners (inclui arquivo obrigatório)
export const newFeaturedBannerValidationSchema =
  commonValidationFeaturedBanner.extend({
    file: z
      .instanceof(File, { message: "Arquivo é obrigatório" })
      .refine(
        (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
        {
          message:
            "Formato de arquivo inválido. Apenas imagens são permitidas.",
        }
      ),
  });

// Esquema para atualização de banners (arquivo opcional)
export const oldFeaturedBannerValidationSchema =
  commonValidationFeaturedBanner.extend({
    file: z.optional(z.instanceof(File)).refine((file) => {
      if (!file) return true; // Se não houver arquivo, está ok
      return ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    }, "Formato de arquivo inválido. Apenas imagens são permitidas."),
  });
