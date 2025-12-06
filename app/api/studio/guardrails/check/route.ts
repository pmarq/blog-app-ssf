import { NextRequest } from "next/server";
import { Action, GuardrailIssue } from "@/app/models/Studio";
import {
  mockActionResult,
  ok,
  badRequest,
  readJson,
} from "../../utils";

interface GuardrailRequestBody {
  context?: Record<string, unknown>;
  html?: string;
  assets?: string[];
  palette?: string[];
  thumbUrl?: string;
}

export async function POST(request: NextRequest) {
  const body = await readJson<GuardrailRequestBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const issues: GuardrailIssue[] = [
    {
      field: "image.alt",
      message: "Adicione alt text descritivo às imagens.",
      severity: "warn",
    },
    {
      field: "palette",
      message: "Paleta fora do padrão preto/branco/cinza/areia/dourado.",
      severity: "warn",
    },
  ];

  const actions: Action[] = [
    {
      type: "guardrail_fix",
      message: "Inserir alt text recomendado nas imagens.",
      data: { suggestion: "Fachada contemporânea com luz suave." },
    },
  ];

  const result = mockActionResult({
    actions,
    issues,
    guardrailScore: 0.72,
    notes: "Mock: checagem de guardrails básica (não bloqueia).",
    context: body.context,
  });

  return ok(result);
}
