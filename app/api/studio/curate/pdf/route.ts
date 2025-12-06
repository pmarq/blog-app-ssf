import { NextRequest } from "next/server";
import { ok, badRequest, readJson, makeRunId } from "../../utils";

interface CuratePdfRequestBody {
  url?: string;
  fileId?: string;
  context?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const body = await readJson<CuratePdfRequestBody>(request);
  if (!body) return badRequest("Invalid JSON body.");
  if (!body.url && !body.fileId) {
    return badRequest("Informe url ou fileId para curadoria de PDF.");
  }

  return ok({
    schemaVersion: "1.0",
    runId: makeRunId(),
    extractedText: "Mock: texto extraído do PDF.",
    sections: [
      { heading: "Resumo", content: "Resumo executivo mock do PDF." },
      { heading: "Destaques", content: "Pontos principais listados aqui." },
    ],
    sources: [body.url || body.fileId],
    notes: "Mock: substitua por extração real na próxima fase.",
  });
}
