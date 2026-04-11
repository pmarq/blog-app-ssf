import { z } from "zod";

export type GenerateJsonInput<T> = {
  prompt: string;
  schema: z.ZodSchema<T>;
  model?: string;
};

export async function generateJson<T>({
  prompt,
  schema,
  model = "gpt-4o-mini",
}: GenerateJsonInput<T>): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Voce responde apenas com JSON valido seguindo o schema solicitado.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao chamar OpenAI: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Resposta vazia da OpenAI.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`JSON invalido: ${(error as Error).message}`);
  }

  return schema.parse(parsed);
}
