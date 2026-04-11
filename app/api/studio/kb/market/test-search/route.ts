import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/server";

export const runtime = "nodejs";

const DEFAULT_RETRIEVE_API_URL = "https://api.inlevor.com.br/ai/retrieve";

function getRetrieveApiUrl() {
  const configured =
    process.env.KB_RETRIEVE_API_URL ||
    process.env.API_INLEVOR_BASE_URL ||
    DEFAULT_RETRIEVE_API_URL;
  const normalized = String(configured || "").replace(/\/+$/, "");
  return normalized.endsWith("/ai/retrieve")
    ? normalized
    : `${normalized}/ai/retrieve`;
}

const normalizeId = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
};

type Payload = {
  query?: string;
  orgId?: string;
  marketScope?: string;
  sourceId?: string;
  limit?: number;
  scoreThreshold?: number;
};

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await auth.verifyIdToken(token);
    if (!decoded.admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Payload;
    const query = String(body?.query || "").trim();
    if (!query) {
      return NextResponse.json(
        { success: false, message: "query e obrigatorio." },
        { status: 400 },
      );
    }

    const orgId = normalizeId(body?.orgId || "inlevor") || "inlevor";
    const marketScope = normalizeId(body?.marketScope || "br") || "br";
    const marketProjectId = `market__${orgId}__${marketScope}`.slice(0, 180);
    const sourceId = String(body?.sourceId || "").trim();
    const limit = Math.min(Math.max(Number(body?.limit || 5), 1), 20);
    const scoreThreshold = Number.isFinite(Number(body?.scoreThreshold))
      ? Number(body?.scoreThreshold)
      : undefined;

    const upstreamResponse = await fetch(getRetrieveApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        limit,
        scoreThreshold,
        sourceProject: "inlevor",
        projectId: marketProjectId,
        kbDomain: "market",
        orgId,
        marketScope,
        ...(sourceId ? { sourceId } : {}),
      }),
      cache: "no-store",
    });

    const rawText = await upstreamResponse.text();
    let upstreamPayload: unknown = null;
    try {
      upstreamPayload = rawText ? JSON.parse(rawText) : null;
    } catch {
      upstreamPayload = null;
    }

    if (!upstreamResponse.ok) {
      const message =
        (upstreamPayload &&
          typeof upstreamPayload === "object" &&
          "error" in upstreamPayload &&
          typeof (upstreamPayload as any).error === "string" &&
          (upstreamPayload as any).error) ||
        `Falha ao consultar busca (${upstreamResponse.status}).`;

      return NextResponse.json(
        { success: false, message, statusCode: upstreamResponse.status },
        { status: upstreamResponse.status === 400 ? 400 : 502 },
      );
    }

    return NextResponse.json({
      success: true,
      orgId,
      marketScope,
      marketProjectId,
      upstream: upstreamPayload,
    });
  } catch (error) {
    console.error("[studio/kb/market/test-search] error:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao testar busca." },
      { status: 500 },
    );
  }
}

