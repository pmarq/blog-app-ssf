// lib/featuredBannerClient.ts

import { z } from "zod";

export const FeaturedBannerClientSchema = z.object({
  title: z.string().nonempty("Título é obrigatório"),
  link: z
    .string()
    .nonempty("Link é obrigatório")
    .url("Link deve ser uma URL válida"),
  linkTitle: z.string().nonempty("Título do link é obrigatório"),
  file: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      {
        message:
          "Formato de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.",
      }
    ),
});

export type FeaturedBannerClient = z.infer<typeof FeaturedBannerClientSchema>;
