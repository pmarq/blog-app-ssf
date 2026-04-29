// lib/ingest.ts
// Notifica o serviço de busca/ingestão sempre que um post é criado ou atualizado.

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

/**
 * Envia os dados do post para o serviço de ingestão (POST /ingest/item).
 * Falhas são registradas em log mas não interrompem o fluxo principal.
 */
export async function notifyIngest(payload: IngestPayload): Promise<void> {
  const ingestUrl = process.env.INGEST_SERVICE_URL;
  if (!ingestUrl) {
    console.warn("[ingest] INGEST_SERVICE_URL não configurada. Pulando ingestão.");
    return;
  }

  try {
    const res = await fetch(`${ingestUrl}/ingest/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[ingest] Falha ao ingerir post "${payload.slug}": ${res.status} ${text}`);
    } else {
      console.log(`[ingest] Post "${payload.slug}" ingerido com sucesso.`);
    }
  } catch (err) {
    console.error("[ingest] Erro ao chamar serviço de ingestão:", err);
  }
}
