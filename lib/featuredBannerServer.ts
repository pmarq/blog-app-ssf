// lib/featuredBannerServer.ts

import { z } from "zod";

export const FeaturedBannerServerSchema = z.object({
  title: z.string().nonempty("Título é obrigatório"),
  link: z
    .string()
    .nonempty("Link é obrigatório")
    .url("Link deve ser uma URL válida"),
  linkTitle: z.string().nonempty("Título do link é obrigatório"),
  imageUrl: z
    .string()
    .nonempty("URL da imagem é obrigatória")
    .url("URL da imagem deve ser válida"),
  publicId: z.string().nonempty("public_id da imagem é obrigatório"),
});

export type FeaturedBannerServer = z.infer<typeof FeaturedBannerServerSchema>;
