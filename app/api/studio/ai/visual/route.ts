import { NextRequest } from "next/server";
import { Action } from "@/app/models/Studio";
import {
  mockActionResult,
  ok,
  badRequest,
  readJson,
  normalizeContext,
} from "../../utils";
import { StudioContext } from "@/app/models/Studio";

interface VisualRequestBody {
  context?: Partial<StudioContext>;
  references?: string[];
  style?: string;
  constraints?: string[];
}

export async function POST(request: NextRequest) {
  const body = await readJson<VisualRequestBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const actions: Action[] = [
    {
      type: "visual_prompt",
      prompt:
        "Estilo Sabores Sem Fronteiras: fotografia de comida com luz natural, fundo limpo, cores quentes e foco em textura.",
    },
    {
      type: "moodboard",
      items: [
        "salada_fresca_luz_natural.jpg",
        "ingredientes_em_mise_en_place.jpg",
        "close_textura_molho.jpg",
      ],
    },
    {
      type: "curation",
      items: body.references || [],
      message: "Curadoria mock baseada nas referências fornecidas.",
    },
  ];

  const result = mockActionResult({
    actions,
    guardrailScore: 0.85,
    notes: "Mock: retornando prompts/curadoria estáticos.",
    context: body.context ? normalizeContext(body.context) : undefined,
  });

  return ok(result);
}
