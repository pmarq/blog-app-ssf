
// app/lib/validationSchemas.ts

import { z, ZodError } from "zod";

export const errorMessages = {
  INVALID_TITLE: "Title is missing!",
  INVALID_TAGS: "Tags must be an array of strings!",
  INVALID_SLUG: "Slug is missing!",
  INVALID_META: "Meta description is missing!",
  INVALID_CONTENT: "Post content is missing!",
};

export const postValidationSchema = z.object({
  title: z.string().min(1, { message: errorMessages.INVALID_TITLE }),
  content: z.string().min(1, { message: errorMessages.INVALID_CONTENT }),
  slug: z.string().min(1, { message: errorMessages.INVALID_SLUG }),
  meta: z.string().min(1, { message: errorMessages.INVALID_META }),
  tags: z.array(z.string(), { required_error: errorMessages.INVALID_TAGS })
    .optional(), // Tornar opcional, caso necessário
});

export const validateSchema = (schema: z.ZodTypeAny, value: any): string => {
  try {
    schema.parse(value);
    return ""; // Sem erros
  } catch (error) {
    if (error instanceof ZodError) {
      // Retorna a primeira mensagem de erro
      return error.errors[0]?.message || "Invalid input";
    }
    throw error; // Caso seja outro tipo de erro, relança a exceção
  }
};
