import { NextRequest } from "next/server";
import { Action } from "@/app/models/Studio";
import { mockActionResult, ok, badRequest, readJson, normalizeContext } from "../../utils";
import { StudioContext } from "@/app/models/Studio";

interface IdeaRequestBody {
  context?: Partial<StudioContext>;
  topic?: string;
  target?: string;
  tone?: string;
  keywords?: string[];
  constraints?: string[];
}

export async function POST(request: NextRequest) {
  const body = await readJson<IdeaRequestBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const actions: Action[] = [
    { type: "insert_title", value: "Título mock: técnicas para saladas frescas" },
    {
      type: "insert_outline",
      items: [
        "Quando faz sentido preparar com antecedência",
        "Armazenamento e organização (sem inventar números)",
        "Erros comuns e como evitar",
        "Checklist final para servir",
      ],
    },
    {
      type: "insert_seo",
      meta: "Guia prático para preparar e armazenar saladas com qualidade, mantendo textura e sabor.",
      tags: ["saladas", "técnicas", "armazenamento", "mise-en-place"],
    },
    {
      type: "insert_ctas",
      items: ["Ver mais posts do tema", "Compartilhar este artigo"],
    },
  ];

  const result = mockActionResult({
    actions,
    guardrailScore: 0.9,
    notes: "Mock: somente para validar o contrato frontend/backend.",
    context: body.context ? normalizeContext(body.context) : undefined,
  });

  return ok(result);
}
