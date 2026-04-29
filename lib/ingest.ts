// lib/ingest.ts
// Notifica o serviço de ingestão sempre que um post é criado ou atualizado.

export interface IngestPayload {
  id: string;
  title: string;
  content: string;
  slug: string;
  meta: string;
  tags: string[];
  categorySlug: string;
  categoryTitle: string;
  thumbnail: string | null;
  source: string;
}

function postToIngestText(payload: IngestPayload) {
  const lines: string[] = [];
  lines.push(`# ${payload.title}`);
  lines.push("");
  lines.push(`slug: ${payload.slug}`);
  if (payload.categoryTitle || payload.categorySlug) {
    lines.push(`category: ${payload.categoryTitle || payload.categorySlug}`);
  }
  if (payload.tags?.length) {
    lines.push(`tags: ${payload.tags.join(", ")}`);
  }
  if (payload.meta) {
    lines.push("");
    lines.push("## Meta");
    lines.push(payload.meta);
  }
  if (payload.thumbnail) {
    lines.push("");
    lines.push(`thumbnail: ${payload.thumbnail}`);
  }
  lines.push("");
  lines.push("## Conteúdo");
  lines.push(payload.content || "");
  return lines.join("\n").trim();
}

/**
 * Envia os dados do post para a Knowledge API (POST /ingest/item).
 * Falhas são registradas em log mas não interrompem o fluxo principal.
 */
export async function notifyIngest(payload: IngestPayload): Promise<void> {
  const ingestUrl = process.env.KNOWLEDGE_API_BASE_URL;
  const ingestToken = process.env.KNOWLEDGE_API_TOKEN;
  if (!ingestUrl) {
    console.warn("[ingest] KNOWLEDGE_API_BASE_URL não configurada. Pulando ingestão.");
    return;
  }

  try {
    const sourceId = String(payload.source || "blog-app-ssf").trim();
    const text = postToIngestText(payload);

    const res = await fetch(`${ingestUrl}/ingest/item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ingestToken && String(ingestToken).trim()
          ? { "x-knowledge-admin-token": String(ingestToken).trim() }
          : {}),
      },
      body: JSON.stringify({
        sourceId,
        sourceItemId: payload.id,
        type: "text",
        text,
        title: payload.title,
        lang: "pt",
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        sourceType: "firestore",
        contentDomain: "blog",
        entityType: "post",
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[ingest] Falha ao ingerir post "${payload.slug}": ${res.status} ${body}`);
    } else {
      console.log(`[ingest] Post "${payload.slug}" ingerido com sucesso.`);
    }
  } catch (err) {
    console.error("[ingest] Erro ao chamar serviço de ingestão:", err);
  }
}

